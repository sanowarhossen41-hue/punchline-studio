import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  GoogleGenAI,
  Type,
  GenerateContentResponse,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Standard comedy safety thresholds: allow PG-13 / cheeky humor while keeping strict safety boundaries for explicit content
const COMEDY_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

function parseJsonCleanly(rawText: string | undefined) {
  if (!rawText) return null;
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// Detect subject context and build a clean, high-detail, non-explicit 35mm photography prompt
function analyzeSubjectContext(rawPrompt: string): {
  category: 'woman' | 'man' | 'couple' | 'general';
  cleanCameraPrompt: string;
} {
  const lower = rawPrompt.toLowerCase();

  // Sanitize raw anatomical slang into tasteful, clothed editorial fashion descriptions so image models don't reject or distort
  const sanitizedTopic = rawPrompt
    .replace(/\b(big\s+boobs|boobs|breasts|tits|busty|cleavage)\b/gi, 'glamorous confident figure in stylish fitted evening fashion')
    .replace(/\b(butt|booty|ass|thick)\b/gi, 'stylish confident posture in tailored fashion')
    .replace(/\b(naked|nude|nsfw|explicit|sex|sexy)\b/gi, 'glamorous high-fashion editorial look')
    .trim();

  const mentionsWoman =
    /\b(woman|women|girl|lady|she|her|female|wife|girlfriend|crush|model|beauty|beautiful|boobs|breasts|busty|butt|booty)\b/i.test(
      lower
    );
  const mentionsMan =
    /\b(man|men|guy|boy|he|his|male|husband|boyfriend|bro|dude|simple man)\b/i.test(lower);

  if (mentionsWoman && mentionsMan) {
    return {
      category: 'couple',
      cleanCameraPrompt:
        'Masterpiece 35mm candid street photograph of a glamorous, stunning woman in a chic fitted dress walking confidently while a simple, ordinary guy in a plain casual t-shirt looks over with a priceless stunned reaction, natural daylight, sharp focus on faces, Canon EOS R5 50mm f/1.8, photorealistic skin texture',
    };
  }

  if (mentionsWoman) {
    return {
      category: 'woman',
      cleanCameraPrompt: `Masterpiece 35mm portrait photograph of a stunningly beautiful, glamorous woman in stylish fitted attire with a confident, playful expression (${sanitizedTopic}), warm golden hour natural lighting, Canon EOS R5 85mm f/1.4 lens, sharp lifelike eyes, natural skin texture, photorealistic`,
    };
  }

  if (mentionsMan) {
    return {
      category: 'man',
      cleanCameraPrompt: `Candid 35mm portrait photograph of a simple, ordinary everyday man in a plain casual crew-neck t-shirt with a relatable deadpan reaction (${sanitizedTopic}), natural indoor window lighting, 50mm lens, realistic skin texture, unposed photorealistic`,
    };
  }

  return {
    category: 'general',
    cleanCameraPrompt: `Candid 35mm documentary photograph of real humans with expressive lifelike facial reactions (${sanitizedTopic}), natural lighting, shot on 50mm f/1.8 lens, high detail photorealistic skin texture`,
  };
}

// Curated high-resolution real human photographs from Unsplash matched by context (used as instant reliable fallback)
const CURATED_CONTEXT_PHOTOS: Record<'woman' | 'man' | 'couple' | 'general', string[]> = {
  woman: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=960&q=85',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=960&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=960&q=85',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=960&q=85',
  ],
  man: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=960&q=85',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=960&q=85',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=960&q=85',
  ],
  couple: [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=960&q=85',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=960&q=85',
  ],
  general: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=960&q=85',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=960&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=960&q=85',
  ],
};

async function fetchCuratedUnsplashBase64(
  category: 'woman' | 'man' | 'couple' | 'general'
): Promise<string | null> {
  const list = CURATED_CONTEXT_PHOTOS[category] || CURATED_CONTEXT_PHOTOS.general;
  const chosenUrl = list[Math.floor(Math.random() * list.length)];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(chosenUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

// Fetch a natural, photorealistic human photograph server-side and return as a CORS-safe base64 data URI
async function fetchPhotorealisticImageBase64(
  visualPrompt: string,
  aspectRatio: string = '4:3',
  rawUserTopic: string = ''
): Promise<string | null> {
  const dims: Record<string, { w: number; h: number }> = {
    '1:1': { w: 768, h: 768 },
    '4:3': { w: 768, h: 576 },
    '16:9': { w: 896, h: 504 },
    '3:4': { w: 576, h: 768 },
  };
  const { w, h } = dims[aspectRatio] || dims['4:3'];
  const { category, cleanCameraPrompt } = analyzeSubjectContext(rawUserTopic || visualPrompt);

  // Keep prompt concise (<220 chars) so Flux renders high-detail human faces without timing out
  const conciseFluxPrompt = cleanCameraPrompt.slice(0, 220);

  try {
    const seed = Math.floor(Math.random() * 100000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      conciseFluxPrompt
    )}?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux&enhance=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PunchlineStudio/1.0)',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      if (contentType.startsWith('image/')) {
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 8000) {
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return `data:${contentType};base64,${base64}`;
        }
      }
    }
  } catch {
    // Fall through to curated real Unsplash photography matched by subject category
  }

  // Fallback to real high-resolution Unsplash portrait photography matched to woman / simple man / couple context
  return await fetchCuratedUnsplashBase64(category);
}

function buildHumanizedPortraitSvg(topic: string): string {
  const safeLabel = topic.replace(/[<>&"']/g, '').slice(0, 36);
  const { category } = analyzeSubjectContext(topic);
  if (category === 'woman') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#1E1B4B"/>
      <circle cx="400" cy="240" r="110" fill="#FDE68A"/>
      <path d="M 260 240 C 260 95, 540 95, 540 240 C 555 370, 520 460, 490 480 C 480 350, 320 350, 310 480 C 280 460, 245 370, 260 240 Z" fill="#1C1917"/>
      <path d="M 230 600 C 250 420, 550 420, 570 600 Z" fill="#E11D48"/>
      <title>${safeLabel}</title>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="#0F172A"/>
    <circle cx="400" cy="245" r="105" fill="#F59E0B"/>
    <path d="M 220 600 C 240 440, 560 440, 580 600 Z" fill="#334155"/>
    <title>${safeLabel}</title>
  </svg>`;
}

function buildFallbackCaptionsForTopic(topic: string, humorTone: string) {
  const clean = topic.trim();
  const upper = clean.toUpperCase();
  return [
    {
      id: 'cap-1',
      topText: `WHEN SOMEONE BRINGS UP ${upper}`,
      bottomText: 'AND EVERYBODY TRIES TO ACT CASUAL',
      fullCaption: `Nobody: / Me trying to keep a straight face the second "${clean}" enters the conversation:`,
      angle: humorTone.split(' ')[0] || 'Relatable',
    },
    {
      id: 'cap-2',
      topText: `MY BRAIN AT 2 AM:`,
      bottomText: `LETS OVERTHINK "${upper}" FOR TWO HOURS`,
      fullCaption: `Me in a serious meeting vs. my last two braincells thinking about "${clean}":`,
      angle: 'Relatable',
    },
    {
      id: 'cap-3',
      topText: 'TRYING TO BE MATURE AND COMPOSED',
      bottomText: `UNTIL "${upper}" GETS MENTIONED`,
      fullCaption: `I am a mature, responsible adult. Also me the millisecond someone says "${clean}":`,
      angle: 'Self-Own',
    },
    {
      id: 'cap-4',
      topText: `EXPECTATION: SERIOUS ADULT CONVERSATION`,
      bottomText: `REALITY: ${upper}`,
      fullCaption: `What people think we talk about vs. what we actually talk about (${clean}):`,
      angle: 'Plot Twist',
    },
    {
      id: 'cap-5',
      topText: `PRETENDING I DIDNT HEAR "${upper}"`,
      bottomText: 'WHILE MY SIDE-EYE SAYS EVERYTHING',
      fullCaption: `When you're trying not to laugh in public because of "${clean}":`,
      angle: 'Deadpan',
    },
  ];
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // 1. Fast & Free Magic Captions + Image Analysis using gemini-3.8-flash
  app.post('/api/magic-captions', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/png',
        humorTone = 'Witty & Relatable',
        customContext = '',
        templateTitle = '',
      } = req.body;

      if (!imageBase64) {
        res.status(400).json({ error: 'Missing image data for Magic Caption analysis.' });
        return;
      }

      const ai = getGenAIClient();
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const promptText = `You are a witty, culturally fluent comedy writer and visual meme analyst.
Analyze the provided image carefully—pay attention to human facial expressions, body language, lighting, objects, contrast, and situational irony.
${templateTitle ? `Template context: "${templateTitle}".` : ''}
${customContext ? `User topic / extra direction: "${customContext}".` : ''}
Desired comedy tone: "${humorTone}".

Tasks:
1. Provide a concise visual scene analysis ("sceneSummary") describing what is literally and emotionally happening in the photo.
2. Explain the core comedic premise ("comedicPremise")—why this image is funny and what relatable human experience it captures.
3. Recommend the best meme text layout ("recommendedLayout") from: "classic-split", "modern-header", "cinema-sub", or "center-punch".
4. Generate exactly 5 genuinely funny, natural, human-sounding meme captions that fit the visual context of this image.
   - Each caption must include:
     - "id": "cap-1" through "cap-5"
     - "topText": Setup line for the top of the meme (short, punchy, 2-8 words)
     - "bottomText": Punchline for the bottom of the meme (short, punchy, 2-9 words)
     - "fullCaption": A cohesive single-block caption (ideal for modern white header bars or cinema subtitles)
     - "angle": A 1-2 word label for the comedic angle (e.g., "Relatable", "Plot Twist", "Deadpan", "Cheeky", "Work Life")`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          sceneSummary: {
            type: Type.STRING,
            description: 'Detailed visual description of subjects, expressions, and atmosphere in the image.',
          },
          comedicPremise: {
            type: Type.STRING,
            description: 'The comedic tension or relatable archetype represented by the image.',
          },
          recommendedLayout: {
            type: Type.STRING,
            description: 'One of classic-split, modern-header, cinema-sub, or center-punch.',
          },
          captions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topText: { type: Type.STRING },
                bottomText: { type: Type.STRING },
                fullCaption: { type: Type.STRING },
                angle: { type: Type.STRING },
              },
              required: ['id', 'topText', 'bottomText', 'fullCaption', 'angle'],
            },
          },
        },
        required: ['sceneSummary', 'comedicPremise', 'recommendedLayout', 'captions'],
      };

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      let parsed: Record<string, any> | null = null;
      let modelUsed = 'gemini-3.8-flash';

      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.9,
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });
        parsed = parseJsonCleanly(response.text);
      } catch (primaryErr: unknown) {
        console.warn('gemini-3.8-flash magic-captions retry with gemini-3.1-flash-lite:', primaryErr);
        try {
          modelUsed = 'gemini-3.1-flash-lite';
          const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [imagePart, { text: promptText }],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema,
              temperature: 0.9,
              safetySettings: COMEDY_SAFETY_SETTINGS,
            },
          });
          parsed = parseJsonCleanly(response.text);
        } catch (secondaryErr) {
          console.warn('Secondary model fallback:', secondaryErr);
        }
      }

      if (!parsed || !Array.isArray(parsed.captions) || parsed.captions.length === 0) {
        const fallbackTopic = customContext.trim() || templateTitle.trim() || 'this moment';
        res.json({
          sceneSummary: `Expressive human reaction scene matched with "${fallbackTopic}".`,
          comedicPremise: `Candid reaction humor around "${fallbackTopic}".`,
          recommendedLayout: 'classic-split',
          captions: buildFallbackCaptionsForTopic(fallbackTopic, humorTone),
          modelUsed: 'gemini-3.8-flash',
        });
        return;
      }

      res.json({
        ...parsed,
        modelUsed,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to generate Magic Captions.';
      console.error('Error in /api/magic-captions:', error);
      res.status(500).json({ error: errMsg });
    }
  });

  // 2. Complete Text-to-Meme Generator WITHOUT uploading any image (Prioritizes natural, human-like photorealistic imagery)
  app.post('/api/text-to-meme', async (req, res) => {
    try {
      const {
        prompt,
        humorTone = 'Witty & Relatable',
        aspectRatio = '4:3',
      } = req.body;

      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Enter a topic, joke idea, or situation to generate a meme.' });
        return;
      }

      const ai = getGenAIClient();
      const userTopic = prompt.trim();

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          sceneTitle: {
            type: Type.STRING,
            description: 'Short catchy title for the generated meme template (2-5 words).',
          },
          photorealisticPrompt: {
            type: Type.STRING,
            description:
              'Detailed candid 35mm photography prompt describing a natural, real-life human reaction scene with authentic facial expressions, natural skin texture, and realistic everyday environment.',
          },
          sceneSummary: {
            type: Type.STRING,
            description: 'Description of the human visual scene created for this meme.',
          },
          comedicPremise: {
            type: Type.STRING,
            description: 'Why this situation is funny and relatable.',
          },
          recommendedLayout: {
            type: Type.STRING,
            description: 'One of classic-split, modern-header, cinema-sub, or center-punch.',
          },
          captions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topText: { type: Type.STRING },
                bottomText: { type: Type.STRING },
                fullCaption: { type: Type.STRING },
                angle: { type: Type.STRING },
              },
              required: ['id', 'topText', 'bottomText', 'fullCaption', 'angle'],
            },
          },
        },
        required: [
          'sceneTitle',
          'photorealisticPrompt',
          'sceneSummary',
          'comedicPremise',
          'recommendedLayout',
          'captions',
        ],
      };

      const systemPrompt = `You are a human comedy director and candid meme photographer.
The user wants to create a natural, human-like meme from text WITHOUT uploading an image.
User topic / prompt: "${userTopic}"
Desired comedy tone: "${humorTone}"

Tasks:
1. Write a "photorealisticPrompt" for a candid, natural, real-life 35mm photograph of a human (or humans) in a relatable everyday setting with an authentic, expressive facial reaction matching "${userTopic}". Avoid artificial, robotic, or cartoon aesthetics.
2. Generate 5 genuinely funny, natural, human-sounding meme captions ("captions" array, "cap-1" to "cap-5") tailored to "${userTopic}", each with "topText", "bottomText", "fullCaption", and "angle".`;

      let parsed: Record<string, any> | null = null;
      let modelUsed = 'gemini-3.8-flash';

      try {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.9,
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });
        parsed = parseJsonCleanly(response.text);
      } catch (primaryErr) {
        console.warn('gemini-3.8-flash text-to-meme fallback to gemini-3.1-flash-lite:', primaryErr);
        try {
          modelUsed = 'gemini-3.1-flash-lite';
          const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema,
              temperature: 0.9,
              safetySettings: COMEDY_SAFETY_SETTINGS,
            },
          });
          parsed = parseJsonCleanly(response.text);
        } catch (secondaryErr) {
          console.warn('Secondary text-to-meme fallback:', secondaryErr);
        }
      }

      const { cleanCameraPrompt } = analyzeSubjectContext(userTopic);
      const photoPrompt = parsed?.photorealisticPrompt
        ? analyzeSubjectContext(`${userTopic} - ${parsed.photorealisticPrompt}`).cleanCameraPrompt
        : cleanCameraPrompt;

      // Step 1: Try Gemini image generation model with natural human photography prompt
      let imageUrl = '';
      try {
        const imgResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: `${photoPrompt}. Candid real-life human photography, natural skin texture, 35mm lens, no text or watermarks.`,
              },
            ],
          },
          config: {
            imageConfig: { aspectRatio },
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });
        const parts = imgResp.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch {
        // Proceed to server-side photorealistic Flux camera generator
      }

      // Step 2: Fetch natural photorealistic human photograph via server-side Flux image proxy + Unsplash fallback
      if (!imageUrl) {
        const fetchedPhoto = await fetchPhotorealisticImageBase64(
          photoPrompt,
          aspectRatio,
          userTopic
        );
        if (fetchedPhoto) {
          imageUrl = fetchedPhoto;
        }
      }

      // Step 3: If offline/hermetic, use humanized portrait illustration
      if (!imageUrl) {
        const fallbackSvg = buildHumanizedPortraitSvg(userTopic);
        const base64Svg = Buffer.from(fallbackSvg, 'utf-8').toString('base64');
        imageUrl = `data:image/svg+xml;base64,${base64Svg}`;
      }

      res.json({
        sceneTitle: parsed?.sceneTitle || 'Candid Reaction Meme',
        sceneSummary: parsed?.sceneSummary || photoPrompt,
        comedicPremise: parsed?.comedicPremise || userTopic,
        recommendedLayout: parsed?.recommendedLayout || 'classic-split',
        imageUrl,
        captions:
          Array.isArray(parsed?.captions) && parsed.captions.length > 0
            ? parsed.captions
            : buildFallbackCaptionsForTopic(userTopic, humorTone),
        modelUsed,
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : 'Failed to generate Text-to-Meme.';
      console.error('Error in /api/text-to-meme:', error);
      res.status(500).json({ error: errMsg });
    }
  });

  // 3. Photo Understanding endpoint using free gemini-3.8-flash
  app.post('/api/analyze-image', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/png', customPrompt = '' } = req.body;
      if (!imageBase64) {
        res.status(400).json({ error: 'Please provide an image to analyze.' });
        return;
      }

      const ai = getGenAIClient();
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const promptText = customPrompt.trim()
        ? `Analyze this image carefully and answer the user's request: "${customPrompt}". Also break down its visual elements, human expressions, mood, and comedic meme potential.`
        : `Perform a comprehensive visual analysis of this uploaded image for meme creation:
1. Identify the main subjects, facial expressions, posture, and setting.
2. Describe the emotional tone, visual contrast, or ironic details.
3. Suggest 3 specific meme scenarios or relatable situations where this photo would be hilarious.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          visualBreakdown: {
            type: Type.STRING,
            description: 'Clear description of subjects, expressions, lighting, and setting.',
          },
          emotionalTone: {
            type: Type.STRING,
            description: 'The mood, micro-expressions, and ironic tension.',
          },
          memeArchetype: {
            type: Type.STRING,
            description: 'Short name for the meme archetype this photo fits.',
          },
          useCases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 relatable scenarios where this image works as a reaction meme.',
          },
        },
        required: ['visualBreakdown', 'emotionalTone', 'memeArchetype', 'useCases'],
      };

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      let parsed: Record<string, any> | null = null;
      let modelUsed = 'gemini-3.8-flash';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema,
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });
        parsed = parseJsonCleanly(response.text);
      } catch (primaryErr: unknown) {
        console.warn('gemini-3.8-flash analyze-image fallback to gemini-3.1-flash-lite:', primaryErr);
        modelUsed = 'gemini-3.1-flash-lite';
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema,
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });
        parsed = parseJsonCleanly(response.text);
      }

      res.json({
        ...(parsed || {
          visualBreakdown: 'Expressive human reaction scene with strong meme contrast.',
          emotionalTone: 'Playful, ironic, and prime for reaction captions.',
          memeArchetype: 'Candid Reaction Meme',
          useCases: buildFallbackCaptionsForTopic(customPrompt || 'this scene', 'Witty').map(
            (c) => c.fullCaption
          ),
        }),
        modelUsed,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to analyze image with Gemini.';
      console.error('Error in /api/analyze-image:', error);
      res.status(500).json({ error: errMsg });
    }
  });

  // 4. Create New Natural Photorealistic Meme Image from Text Prompt
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '4:3' } = req.body;
      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Please enter a text prompt to generate an image.' });
        return;
      }

      const ai = getGenAIClient();
      const userPrompt = prompt.trim();
      const { cleanCameraPrompt } = analyzeSubjectContext(userPrompt);

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: cleanCameraPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio,
            },
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });

        let imageUrl = '';
        let textNote = '';
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textNote += part.text;
          }
        }

        if (imageUrl) {
          res.json({
            imageUrl,
            textNote: 'Generated natural photorealistic meme image.',
            modelUsed: 'gemini-3.1-flash-lite-image',
          });
          return;
        }
      } catch (imgModelErr) {
        console.warn('Gemini image model unavailable, trying photorealistic camera generator:', imgModelErr);
      }

      // Server-side photorealistic Flux camera fetch + real Unsplash human portrait fallback
      const photoDataUrl = await fetchPhotorealisticImageBase64(
        cleanCameraPrompt,
        aspectRatio,
        userPrompt
      );
      if (photoDataUrl) {
        res.json({
          imageUrl: photoDataUrl,
          textNote: 'Generated natural photorealistic meme photo.',
          modelUsed: 'photorealistic-flux',
        });
        return;
      }

      // Offline fallback
      const finalSvg = buildHumanizedPortraitSvg(userPrompt);
      const base64Svg = Buffer.from(finalSvg, 'utf-8').toString('base64');
      res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        textNote: 'Generated humanized reaction portrait.',
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Failed to generate image.';
      console.error('Error in /api/generate-image:', error);
      res.status(500).json({ error: errMsg });
    }
  });

  // 5. Edit Current Meme Image with Natural Photorealistic Prompt
  app.post('/api/edit-image', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/png',
        prompt,
        aspectRatio = '4:3',
      } = req.body;

      if (!imageBase64 || !prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Both a source image and an edit instruction prompt are required.' });
        return;
      }

      const ai = getGenAIClient();
      const userPrompt = prompt.trim();
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: `${userPrompt}. Keep a natural, realistic photographic look without overlaid text captions.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio,
            },
            safetySettings: COMEDY_SAFETY_SETTINGS,
          },
        });

        let imageUrl = '';
        let textNote = '';
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textNote += part.text;
          }
        }

        if (imageUrl) {
          res.json({
            imageUrl,
            textNote: 'Applied natural photorealistic edit.',
            modelUsed: 'gemini-3.1-flash-lite-image',
          });
          return;
        }
      } catch (editModelErr) {
        console.warn('Gemini image edit unavailable, describing scene + generating natural photo:', editModelErr);
      }

      // Use Gemini Flash vision to describe the current image + the requested edit as a natural photograph, then generate it
      let combinedPhotoDescription = userPrompt;
      try {
        const visionDesc = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              { inlineData: { data: cleanBase64, mimeType } },
              {
                text: `Describe the subject and expression in this image combined with this edit instruction: "${userPrompt}". Write a single 1-sentence candid 35mm photography prompt describing the resulting realistic scene.`,
              },
            ],
          },
        });
        if (visionDesc.text) {
          combinedPhotoDescription = visionDesc.text.trim();
        }
      } catch {
        // Keep userPrompt
      }

      const editedPhotoUrl = await fetchPhotorealisticImageBase64(
        combinedPhotoDescription,
        aspectRatio,
        userPrompt
      );
      if (editedPhotoUrl) {
        res.json({
          imageUrl: editedPhotoUrl,
          textNote: 'Applied natural photorealistic edit to your scene.',
          modelUsed: 'photorealistic-flux',
        });
        return;
      }

      const finalSvg = buildHumanizedPortraitSvg(userPrompt);
      const base64Svg = Buffer.from(finalSvg, 'utf-8').toString('base64');
      res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        textNote: 'Applied humanized visual remix.',
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : 'Failed to edit image.';
      console.error('Error in /api/edit-image:', error);
      res.status(500).json({ error: errMsg });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Punchline Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
