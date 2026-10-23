/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Wand2,
  Upload,
  Download,
  Sparkles,
  Image as ImageIcon,
  ScanEye,
  Bookmark,
  Check,
  ArrowUpDown,
  Trash2,
  Copy,
  Sliders,
  AlertCircle,
  Layers,
  RotateCcw,
  Flame,
  Zap,
  Crop,
  X,
} from 'lucide-react';
import { TRENDING_TEMPLATES } from './data/templates';
import {
  MemeLayoutStyle,
  MemeFontFamily,
  MemeFilterType,
  MagicCaptionSuggestion,
  MagicCaptionResult,
  TextToMemeResult,
  DeepImageAnalysis,
  MemeTemplate,
  SavedMeme,
} from './types/meme';

const HUMOR_TONES = [
  'Witty & Relatable',
  'Cheeky & Unfiltered',
  'Absurdist & Gen-Z',
  'Tech & Work Life',
  'Dry & Sarcastic',
  'Wholesome Chaos',
];

const MEME_FILTERS: { id: MemeFilterType; label: string; desc: string }[] = [
  { id: 'none', label: 'Original', desc: 'Clean unfiltered image' },
  { id: 'deep-fried', label: 'Deep Fried', desc: 'Crunchy saturation & orange flare' },
  { id: 'noir', label: 'Dramatic B&W', desc: 'High-contrast cinema noir' },
  { id: 'vhs-90s', label: '90s VHS Cam', desc: 'Scanlines & retro camcorder stamp' },
  { id: 'vaporwave', label: 'Vaporwave', desc: 'Neon magenta & cyan duotone' },
  { id: 'sepia-vintage', label: '1890s Vintage', desc: 'Warm antique sepia vignette' },
  { id: 'intense-red', label: 'Intense / Panik', desc: 'Crimson surge & radial speed lines' },
];

const TEXT_TO_MEME_TOPICS = [
  'Saying I will go to sleep early at 10 PM vs me at 3:45 AM reading about deep-sea squids',
  'Software developer explaining why a 1-line button change will take 3 weeks',
  'My cat staring at an empty wall corner at midnight like it sees a Victorian ghost',
  'Trying to act normal in a video call when the food delivery driver rings the doorbell',
];

const PROMPT_STARTERS = [
  'Candid 35mm photo of an exhausted office worker staring in disbelief at a laptop screen with a half-empty coffee mug',
  'Natural documentary photo of two friends at a dinner table giving each other a skeptical side-eye glance',
  'Candid street photograph of a guy looking completely bewildered at a grocery store receipt in his hand',
  'Expressive portrait of a woman trying hard not to laugh during a serious boardroom presentation',
];

const EDIT_STARTERS = [
  'Add a tiny festive party hat and confetti falling in the background',
  'Put the subject on the red rocky surface of Mars with a domed space habitat behind them',
  'Transform the entire scene into a dramatic 19th-century oil painting with rich brush strokes',
  'Add cool pixel-art sunglasses and a dramatic golden sunset backdrop',
];

export default function App() {
  // Current Image & Template State
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(TRENDING_TEMPLATES[0]);
  const [baseImageSrc, setBaseImageSrc] = useState<string>(TRENDING_TEMPLATES[0].imageUrl);
  const [previousImageSrc, setPreviousImageSrc] = useState<string | null>(null);
  const [imageSourceTitle, setImageSourceTitle] = useState<string>(TRENDING_TEMPLATES[0].title);

  // Caption, Typography & Meme Filter State
  const [layoutStyle, setLayoutStyle] = useState<MemeLayoutStyle>(TRENDING_TEMPLATES[0].defaultLayout);
  const [topText, setTopText] = useState<string>(TRENDING_TEMPLATES[0].defaultTopText);
  const [bottomText, setBottomText] = useState<string>(TRENDING_TEMPLATES[0].defaultBottomText);
  const [fullCaption, setFullCaption] = useState<string>(TRENDING_TEMPLATES[0].defaultFullCaption);
  const [fontFamily, setFontFamily] = useState<MemeFontFamily>('Anton');
  const [fontSize, setFontSize] = useState<number>(42);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [allCaps, setAllCaps] = useState<boolean>(true);
  const [memeFilter, setMemeFilter] = useState<MemeFilterType>('none');
  const [filterIntensity, setFilterIntensity] = useState<number>(85);

  // Interactive Image Cropping State (percentages 0..100 of source image)
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropW, setCropW] = useState<number>(80);
  const [cropH, setCropH] = useState<number>(80);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const cropDragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);

  // Text-to-Meme (No Image Needed) State
  const [textToMemeTopic, setTextToMemeTopic] = useState<string>('');
  const [isGeneratingTextToMeme, setIsGeneratingTextToMeme] = useState<boolean>(false);
  const [textToMemeError, setTextToMemeError] = useState<string | null>(null);

  // Right Panel AI Mode ('magic-captions' | 'ai-image-lab' | 'scene-analyzer')
  const [activeAiTab, setActiveAiTab] = useState<'magic-captions' | 'ai-image-lab' | 'scene-analyzer'>('magic-captions');

  // Magic Captions (gemini-3.8-flash) State
  const [humorTone, setHumorTone] = useState<string>(HUMOR_TONES[0]);
  const [customContext, setCustomContext] = useState<string>('');
  const [captionsList, setCaptionsList] = useState<MagicCaptionSuggestion[]>(
    TRENDING_TEMPLATES[0].precomputedCaptions
  );
  const [activeCaptionId, setActiveCaptionId] = useState<string>(
    TRENDING_TEMPLATES[0].precomputedCaptions[0]?.id || ''
  );
  const [sceneSummary, setSceneSummary] = useState<string>(
    TRENDING_TEMPLATES[0].description
  );
  const [comedicPremise, setComedicPremise] = useState<string>(
    'High-stakes late-night debugging panic contrasted with an adorable wide-eyed tabby cat.'
  );
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState<boolean>(false);
  const [captionError, setCaptionError] = useState<string | null>(null);

  // AI Image Lab State
  const [imageLabMode, setImageLabMode] = useState<'create' | 'edit'>('create');
  const [createPrompt, setCreatePrompt] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [genAspectRatio, setGenAspectRatio] = useState<string>('4:3');
  const [genImageSize, setGenImageSize] = useState<string>('1K');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageLabError, setImageLabError] = useState<string | null>(null);
  const [imageLabSuccess, setImageLabSuccess] = useState<string | null>(null);

  // Deep Scene Analyzer State
  const [analyzerQuestion, setAnalyzerQuestion] = useState<string>('');
  const [deepAnalysis, setDeepAnalysis] = useState<DeepImageAnalysis | null>(null);
  const [isAnalyzingScene, setIsAnalyzingScene] = useState<boolean>(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Template Filtering & Saved Memes Gallery
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  const [savedMemes, setSavedMemes] = useState<SavedMeme[]>(() => {
    try {
      const raw = localStorage.getItem('punchline_saved_memes_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Refs
  const memeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studioRef = useRef<HTMLElement | null>(null);

  // Persist saved memes
  useEffect(() => {
    try {
      localStorage.setItem('punchline_saved_memes_v1', JSON.stringify(savedMemes));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedMemes]);

  // Helper: Wrap text into lines that fit maxWidth on canvas
  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.trim().split(/\s+/);
    if (!words.length || !words[0]) return [];
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Helper: Draw base image with selected Meme Filter onto the canvas region (0, offsetY, width, height)
  const drawFilteredImageRegion = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    offsetY: number,
    width: number,
    height: number,
    filter: MemeFilterType,
    intensityPct: number
  ) => {
    const strength = Math.max(0.1, Math.min(1, intensityPct / 100));

    ctx.save();
    // Apply CSS canvas filter string based on filter type and strength
    if (filter === 'deep-fried') {
      const contrast = Math.round(100 + 180 * strength);
      const saturate = Math.round(100 + 320 * strength);
      const brightness = Math.round(100 + 12 * strength);
      ctx.filter = `contrast(${contrast}%) saturate(${saturate}%) brightness(${brightness}%)`;
    } else if (filter === 'noir') {
      const gray = Math.round(100 * strength);
      const contrast = Math.round(100 + 65 * strength);
      ctx.filter = `grayscale(${gray}%) contrast(${contrast}%) brightness(95%)`;
    } else if (filter === 'vhs-90s') {
      const sat = Math.round(100 + 35 * strength);
      const con = Math.round(100 + 20 * strength);
      ctx.filter = `saturate(${sat}%) contrast(${con}%) sepia(${Math.round(22 * strength)}%)`;
    } else if (filter === 'vaporwave') {
      const hue = Math.round(-28 * strength);
      const sat = Math.round(100 + 95 * strength);
      ctx.filter = `hue-rotate(${hue}deg) saturate(${sat}%) contrast(115%)`;
    } else if (filter === 'sepia-vintage') {
      const sep = Math.round(90 * strength);
      const con = Math.round(100 + 25 * strength);
      ctx.filter = `sepia(${sep}%) contrast(${con}%) brightness(96%)`;
    } else if (filter === 'intense-red') {
      const con = Math.round(100 + 90 * strength);
      const sat = Math.round(100 + 150 * strength);
      ctx.filter = `contrast(${con}%) saturate(${sat}%)`;
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(img, 0, offsetY, width, height);
    ctx.filter = 'none';
    ctx.restore();

    // Procedural post-processing overlays for authentic meme aesthetics
    if (filter === 'deep-fried') {
      ctx.save();
      // Warm orange/red deep-fried color burn
      const radial = ctx.createRadialGradient(
        width / 2,
        offsetY + height / 2,
        width * 0.15,
        width / 2,
        offsetY + height / 2,
        width * 0.65
      );
      radial.addColorStop(0, `rgba(255, 180, 0, ${0.14 * strength})`);
      radial.addColorStop(0.6, `rgba(239, 68, 68, ${0.24 * strength})`);
      radial.addColorStop(1, `rgba(127, 29, 29, ${0.42 * strength})`);
      ctx.fillStyle = radial;
      ctx.fillRect(0, offsetY, width, height);

      // Crunchy halftone/grain dots
      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * strength})`;
      const step = 12;
      for (let y = offsetY; y < offsetY + height; y += step) {
        for (let x = (y % (step * 2) === 0 ? 0 : 6); x < width; x += step) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.restore();
    } else if (filter === 'noir' || filter === 'sepia-vintage') {
      ctx.save();
      const vig = ctx.createRadialGradient(
        width / 2,
        offsetY + height / 2,
        width * 0.25,
        width / 2,
        offsetY + height / 2,
        width * 0.68
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, `rgba(0,0,0,${0.55 * strength})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, offsetY, width, height);
      ctx.restore();
    } else if (filter === 'vhs-90s') {
      ctx.save();
      // Horizontal CRT scanlines
      ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * strength})`;
      for (let y = offsetY; y < offsetY + height; y += 5) {
        ctx.fillRect(0, y, width, 2);
      }
      // Subtle cyan/magenta edge aberration bar
      ctx.fillStyle = `rgba(56, 189, 248, ${0.12 * strength})`;
      ctx.fillRect(0, offsetY + height * 0.18, width, 6);
      // VHS Camcorder OSD timestamp
      ctx.font = '600 22px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(250, 204, 21, ${0.88 * strength})`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText('PLAY ▶  SP 03:14:09', 32, offsetY + 42);
      ctx.restore();
    } else if (filter === 'vaporwave') {
      ctx.save();
      const grad = ctx.createLinearGradient(0, offsetY, width, offsetY + height);
      grad.addColorStop(0, `rgba(236, 72, 153, ${0.28 * strength})`);
      grad.addColorStop(0.5, `rgba(139, 92, 246, ${0.18 * strength})`);
      grad.addColorStop(1, `rgba(6, 182, 212, ${0.32 * strength})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, offsetY, width, height);
      ctx.restore();
    } else if (filter === 'intense-red') {
      ctx.save();
      // Crimson surge overlay
      const redGrad = ctx.createRadialGradient(
        width / 2,
        offsetY + height / 2,
        width * 0.18,
        width / 2,
        offsetY + height / 2,
        width * 0.65
      );
      redGrad.addColorStop(0, 'rgba(220, 38, 38, 0.05)');
      redGrad.addColorStop(1, `rgba(185, 28, 28, ${0.52 * strength})`);
      ctx.fillStyle = redGrad;
      ctx.fillRect(0, offsetY, width, height);

      // Radial speed/intensity lines around the edges
      const cx = width / 2;
      const cy = offsetY + height / 2;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * strength})`;
      ctx.lineWidth = 3;
      const numRays = 36;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        const innerR = Math.min(width, height) * 0.36;
        const outerR = Math.max(width, height) * 0.75;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  // Render the Meme onto the HTML5 Canvas
  const renderMemeCanvas = useCallback(() => {
    const canvas = memeCanvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetWidth = 960;
    const imgAspect = (img.naturalWidth || 800) / (img.naturalHeight || 600);
    const baseImgHeight = Math.round(targetWidth / imgAspect);

    // Format text according to allCaps setting
    const formatText = (str: string) =>
      allCaps && layoutStyle !== 'modern-header' ? str.toUpperCase() : str;

    if (layoutStyle === 'modern-header') {
      // Modern White Header Bar above image
      const headerText = fullCaption.trim() || `${topText} — ${bottomText}`;
      const headerFontSize = Math.max(24, Math.round(fontSize * 0.78));
      ctx.font = `600 ${headerFontSize}px "${fontFamily === 'Anton' ? 'Plus Jakarta Sans' : fontFamily}", sans-serif`;
      const maxHeaderWidth = targetWidth - 80;
      const lines = wrapCanvasText(ctx, headerText, maxHeaderWidth);
      const lineHeight = Math.round(headerFontSize * 1.32);
      const headerPaddingY = 36;
      const headerHeight = Math.max(96, lines.length * lineHeight + headerPaddingY * 2);

      canvas.width = targetWidth;
      canvas.height = headerHeight + baseImgHeight;

      // Draw crisp white header bar
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, headerHeight);

      // Draw header text
      ctx.font = `600 ${headerFontSize}px "${fontFamily === 'Anton' ? 'Plus Jakarta Sans' : fontFamily}", sans-serif`;
      ctx.fillStyle = '#09090B';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((line, idx) => {
        ctx.fillText(line, 40, headerPaddingY + idx * lineHeight);
      });

      // Subtle divider line
      ctx.fillStyle = '#E4E4E7';
      ctx.fillRect(0, headerHeight - 1, targetWidth, 1);

      // Draw filtered image below header
      drawFilteredImageRegion(
        ctx,
        img,
        headerHeight,
        targetWidth,
        baseImgHeight,
        memeFilter,
        filterIntensity
      );
      return;
    }

    // For classic-split, cinema-sub, and center-punch, canvas matches image dimensions
    canvas.width = targetWidth;
    canvas.height = baseImgHeight;
    drawFilteredImageRegion(
      ctx,
      img,
      0,
      targetWidth,
      baseImgHeight,
      memeFilter,
      filterIntensity
    );

    const drawStrokedLines = (
      lines: string[],
      startY: number,
      lineHeight: number,
      fill: string,
      stroke: number
    ) => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        if (stroke > 0) {
          ctx.strokeStyle = '#09090B';
          ctx.lineWidth = stroke * 2;
          ctx.strokeText(line, targetWidth / 2, y);
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = fill;
        ctx.fillText(line, targetWidth / 2, y);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      });
    };

    if (layoutStyle === 'classic-split') {
      const scaledFontSize = Math.round(fontSize * 1.2);
      const weight = fontFamily === 'Anton' ? '400' : '800';
      ctx.font = `${weight} ${scaledFontSize}px "${fontFamily}", Impact, sans-serif`;
      const lineHeight = Math.round(scaledFontSize * 1.12);
      const maxWidth = targetWidth - 72;

      if (topText.trim()) {
        const topLines = wrapCanvasText(ctx, formatText(topText), maxWidth);
        drawStrokedLines(topLines, 28, lineHeight, textColor, strokeWidth);
      }

      if (bottomText.trim()) {
        const bottomLines = wrapCanvasText(ctx, formatText(bottomText), maxWidth);
        const totalBottomHeight = bottomLines.length * lineHeight;
        const startY = Math.max(28, baseImgHeight - totalBottomHeight - 28);
        drawStrokedLines(bottomLines, startY, lineHeight, textColor, strokeWidth);
      }
    } else if (layoutStyle === 'cinema-sub') {
      const subText = fullCaption.trim() || bottomText.trim() || topText.trim();
      if (subText) {
        const grad = ctx.createLinearGradient(0, baseImgHeight * 0.58, 0, baseImgHeight);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, baseImgHeight * 0.58, targetWidth, baseImgHeight * 0.42);

        const subFontSize = Math.max(24, Math.round(fontSize * 0.85));
        ctx.font = `italic 600 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
        const lines = wrapCanvasText(ctx, subText, targetWidth - 120);
        const lineHeight = Math.round(subFontSize * 1.32);
        const totalH = lines.length * lineHeight;
        const startY = baseImgHeight - totalH - 36;
        drawStrokedLines(
          lines,
          startY,
          lineHeight,
          textColor === '#FFFFFF' ? '#FACC15' : textColor,
          Math.max(3, Math.round(strokeWidth * 0.6))
        );
      }
    } else if (layoutStyle === 'center-punch') {
      const centerLine = formatText(
        [topText.trim(), bottomText.trim()].filter(Boolean).join(' • ') || fullCaption
      );
      if (centerLine) {
        ctx.fillStyle = 'rgba(9, 9, 11, 0.35)';
        ctx.fillRect(0, 0, targetWidth, baseImgHeight);

        const scaledFontSize = Math.round(fontSize * 1.25);
        const weight = fontFamily === 'Anton' ? '400' : '800';
        ctx.font = `${weight} ${scaledFontSize}px "${fontFamily}", Impact, sans-serif`;
        const lines = wrapCanvasText(ctx, centerLine, targetWidth - 88);
        const lineHeight = Math.round(scaledFontSize * 1.15);
        const totalH = lines.length * lineHeight;
        const startY = Math.round((baseImgHeight - totalH) / 2);
        drawStrokedLines(lines, startY, lineHeight, textColor, strokeWidth);
      }
    }
  }, [
    layoutStyle,
    topText,
    bottomText,
    fullCaption,
    fontFamily,
    fontSize,
    textColor,
    strokeWidth,
    allCaps,
    memeFilter,
    filterIntensity,
  ]);

  const renderMemeCanvasRef = useRef(renderMemeCanvas);
  useEffect(() => {
    renderMemeCanvasRef.current = renderMemeCanvas;
  }, [renderMemeCanvas]);

  // Load image ONLY when baseImageSrc changes
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    if (!baseImageSrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (isCancelled) return;
      loadedImageRef.current = img;
      renderMemeCanvasRef.current();
    };
    img.src = baseImageSrc;
    return () => {
      isCancelled = true;
    };
  }, [baseImageSrc]);

  // Re-render canvas immediately whenever text, filter, or style changes
  useEffect(() => {
    renderMemeCanvas();
  }, [renderMemeCanvas]);

  // Helper: Extract clean base64 PNG of the raw source image (without text overlay) for Gemini API calls
  const getRawImageBase64 = async (): Promise<{ base64: string; mimeType: string } | null> => {
    let img = loadedImageRef.current;
    if (!img || !img.complete) {
      img = await new Promise<HTMLImageElement | null>((resolve) => {
        const tempImg = new Image();
        if (!baseImageSrc.startsWith('data:')) {
          tempImg.crossOrigin = 'anonymous';
        }
        tempImg.onload = () => {
          loadedImageRef.current = tempImg;
          resolve(tempImg);
        };
        tempImg.onerror = () => resolve(null);
        tempImg.src = baseImageSrc;
      });
    }
    if (!img) return null;
    const offscreen = document.createElement('canvas');
    const maxDim = 960;
    const w = img.naturalWidth || img.width || 800;
    const h = img.naturalHeight || img.height || 600;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    offscreen.width = Math.max(1, Math.round(w * scale));
    offscreen.height = Math.max(1, Math.round(h * scale));
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
    const dataUrl = offscreen.toDataURL('image/png');
    return {
      base64: dataUrl,
      mimeType: 'image/png',
    };
  };

  // Select a Trending Template
  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setPreviousImageSrc(null);
    setBaseImageSrc(template.imageUrl);
    setImageSourceTitle(template.title);
    setLayoutStyle(template.defaultLayout);
    setTopText(template.defaultTopText);
    setBottomText(template.defaultBottomText);
    setFullCaption(template.defaultFullCaption);
    setCaptionsList(template.precomputedCaptions);
    setActiveCaptionId(template.precomputedCaptions[0]?.id || '');
    setSceneSummary(template.description);
    setComedicPremise(`Classic "${template.title}" setup in the ${template.category} category.`);
    setCaptionError(null);
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Apply a Magic Caption Suggestion with 1 click
  const handleApplyCaption = (caption: MagicCaptionSuggestion) => {
    setActiveCaptionId(caption.id);
    setTopText(caption.topText);
    setBottomText(caption.bottomText);
    setFullCaption(caption.fullCaption);
  };

  // Handle User File Upload
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCaptionError('Please upload a valid image file (PNG, JPG, WebP, or GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviousImageSrc(baseImageSrc);
        setBaseImageSrc(result);
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setImageSourceTitle(cleanName || 'Uploaded Photo');
        setCaptionError(null);
        setDeepAnalysis(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Interactive Image Crop Handlers
  const applyCropPreset = (preset: 'free' | '1:1' | '4:3' | '16:9' | '3:4') => {
    const img = loadedImageRef.current;
    const natW = img?.naturalWidth || 800;
    const natH = img?.naturalHeight || 600;

    if (preset === 'free') {
      setCropX(10);
      setCropY(10);
      setCropW(80);
      setCropH(80);
      return;
    }

    const ratios: Record<string, number> = {
      '1:1': 1,
      '4:3': 4 / 3,
      '16:9': 16 / 9,
      '3:4': 3 / 4,
    };
    const targetRatio = ratios[preset] || 1;
    const imgRatio = natW / natH;

    let newW = 80;
    let newH = 80;
    if (targetRatio > imgRatio) {
      newW = 84;
      newH = Math.min(95, Math.round((newW * imgRatio) / targetRatio));
    } else {
      newH = 84;
      newW = Math.min(95, Math.round((newH * targetRatio) / imgRatio));
    }
    setCropW(newW);
    setCropH(newH);
    setCropX(Math.round((100 - newW) / 2));
    setCropY(Math.round((100 - newH) / 2));
  };

  const handleApplyCrop = async () => {
    let img = loadedImageRef.current;
    if (!img || !img.complete) {
      img = await new Promise<HTMLImageElement | null>((resolve) => {
        const temp = new Image();
        if (!baseImageSrc.startsWith('data:')) temp.crossOrigin = 'anonymous';
        temp.onload = () => resolve(temp);
        temp.onerror = () => resolve(null);
        temp.src = baseImageSrc;
      });
    }
    if (!img) return;

    const natW = img.naturalWidth || img.width || 800;
    const natH = img.naturalHeight || img.height || 600;

    const sx = Math.max(0, Math.round((cropX / 100) * natW));
    const sy = Math.max(0, Math.round((cropY / 100) * natH));
    const sw = Math.max(32, Math.min(natW - sx, Math.round((cropW / 100) * natW)));
    const sh = Math.max(32, Math.min(natH - sy, Math.round((cropH / 100) * natH)));

    const offscreen = document.createElement('canvas');
    offscreen.width = sw;
    offscreen.height = sh;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const croppedDataUrl = offscreen.toDataURL('image/png');

    setPreviousImageSrc(baseImageSrc);
    setBaseImageSrc(croppedDataUrl);
    setIsCropping(false);
    setExportStatus('Applied Image Crop');
    setTimeout(() => setExportStatus(null), 2500);
  };

  // Core Feature: One-Click Text-to-Meme WITHOUT Uploading Any Image
  const handleGenerateTextToMeme = async (topicOverride?: string) => {
    const finalTopic = (topicOverride ?? textToMemeTopic).trim();
    if (!finalTopic) {
      setTextToMemeError('Type a joke idea, relatable situation, or topic first!');
      return;
    }

    setIsGeneratingTextToMeme(true);
    setTextToMemeError(null);
    setCaptionError(null);

    try {
      const response = await fetch('/api/text-to-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalTopic,
          humorTone,
          aspectRatio: genAspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Text-to-Meme.');
      }

      const result = data as TextToMemeResult;
      setPreviousImageSrc(baseImageSrc);
      setBaseImageSrc(result.imageUrl);
      setImageSourceTitle(result.sceneTitle || 'Text-to-Meme Creation');
      setSceneSummary(result.sceneSummary || finalTopic);
      setComedicPremise(result.comedicPremise || finalTopic);

      if (result.captions && result.captions.length > 0) {
        setCaptionsList(result.captions);
        handleApplyCaption(result.captions[0]);
      }
      setActiveAiTab('magic-captions');
      studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate Text-to-Meme.';
      setTextToMemeError(msg);
    } finally {
      setIsGeneratingTextToMeme(false);
    }
  };

  // Core Feature 1: Fast & Free Magic Captions via gemini-3.8-flash
  const handleGenerateMagicCaptions = async () => {
    setIsGeneratingCaptions(true);
    setCaptionError(null);

    try {
      const rawImg = await getRawImageBase64();
      if (!rawImg) {
        throw new Error('Could not read the current image from the canvas.');
      }

      const response = await fetch('/api/magic-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: rawImg.base64,
          mimeType: rawImg.mimeType,
          humorTone,
          customContext,
          templateTitle: imageSourceTitle,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Magic Captions.');
      }

      const result = data as MagicCaptionResult;
      if (result.captions && result.captions.length > 0) {
        setCaptionsList(result.captions);
        setSceneSummary(result.sceneSummary || sceneSummary);
        setComedicPremise(result.comedicPremise || comedicPremise);
        handleApplyCaption(result.captions[0]);
      } else {
        throw new Error('No captions were returned. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reach Gemini API.';
      setCaptionError(msg);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Core Feature 2: Fast & Free Image Understanding via gemini-3.8-flash
  const handleAnalyzeScene = async () => {
    setIsAnalyzingScene(true);
    setAnalyzerError(null);

    try {
      const rawImg = await getRawImageBase64();
      if (!rawImg) {
        throw new Error('Could not read the current image for analysis.');
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: rawImg.base64,
          mimeType: rawImg.mimeType,
          customPrompt: analyzerQuestion,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image.');
      }

      setDeepAnalysis(data as DeepImageAnalysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Scene analysis failed.';
      setAnalyzerError(msg);
    } finally {
      setIsAnalyzingScene(false);
    }
  };

  // Core Feature 3: Create or Edit Images
  const handleCreateAiImage = async () => {
    if (!createPrompt.trim()) {
      setImageLabError('Enter a visual description to generate your custom meme image.');
      return;
    }

    setIsProcessingImage(true);
    setImageLabError(null);
    setImageLabSuccess(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: createPrompt,
          aspectRatio: genAspectRatio,
          imageSize: genImageSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Image generation failed.');
      }

      setPreviousImageSrc(baseImageSrc);
      setBaseImageSrc(data.imageUrl);
      setImageSourceTitle('AI Generated Scene');
      setImageLabSuccess(
        data.textNote || 'Generated custom meme scene! Click "Magic Caption" to write 5 jokes for it.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate image.';
      setImageLabError(msg);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleEditAiImage = async () => {
    if (!editPrompt.trim()) {
      setImageLabError('Enter an instruction describing how to edit the current image.');
      return;
    }

    setIsProcessingImage(true);
    setImageLabError(null);
    setImageLabSuccess(null);

    try {
      const rawImg = await getRawImageBase64();
      if (!rawImg) {
        throw new Error('Could not read the current image for editing.');
      }

      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: rawImg.base64,
          mimeType: rawImg.mimeType,
          prompt: editPrompt,
          aspectRatio: genAspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Image edit failed.');
      }

      setPreviousImageSrc(baseImageSrc);
      setBaseImageSrc(data.imageUrl);
      setImageSourceTitle(`${imageSourceTitle.replace(/ \(Edited\)$/, '')} (Edited)`);
      setImageLabSuccess(data.textNote || 'Applied AI visual edit to your meme canvas.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to edit image.';
      setImageLabError(msg);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Export, Copy & Save Actions (Supports both PNG and JPG)
  const handleDownloadMeme = (format: 'png' | 'jpg' = 'png') => {
    const canvas = memeCanvasRef.current;
    if (!canvas) return;

    let dataUrl = '';
    if (format === 'jpg') {
      // Composite onto opaque background for clean JPEG encoding
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = canvas.width;
      jpgCanvas.height = canvas.height;
      const jCtx = jpgCanvas.getContext('2d');
      if (jCtx) {
        jCtx.fillStyle = '#09090B';
        jCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
        jCtx.drawImage(canvas, 0, 0);
        dataUrl = jpgCanvas.toDataURL('image/jpeg', 0.94);
      } else {
        dataUrl = canvas.toDataURL('image/jpeg', 0.94);
      }
    } else {
      dataUrl = canvas.toDataURL('image/png');
    }

    const link = document.createElement('a');
    const slug = imageSourceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `punchline-${slug || 'meme'}.${format}`;
    link.href = dataUrl;
    link.click();
    setExportStatus(`Downloaded ${format.toUpperCase()}`);
    setTimeout(() => setExportStatus(null), 2500);
  };

  const handleDownloadSavedMeme = (meme: SavedMeme, format: 'png' | 'jpg') => {
    const slug = meme.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'meme';
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `${slug}.png`;
      link.href = meme.dataUrl;
      link.click();
      return;
    }

    const img = new Image();
    img.onload = () => {
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = img.naturalWidth || 960;
      jpgCanvas.height = img.naturalHeight || 720;
      const ctx = jpgCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#09090B';
        ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
        ctx.drawImage(img, 0, 0);
        const jpgUrl = jpgCanvas.toDataURL('image/jpeg', 0.94);
        const link = document.createElement('a');
        link.download = `${slug}.jpg`;
        link.href = jpgUrl;
        link.click();
      }
    };
    img.src = meme.dataUrl;
  };

  const handleCopyMemeToClipboard = async () => {
    const canvas = memeCanvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setExportStatus('Copied to Clipboard');
        setTimeout(() => setExportStatus(null), 2500);
      } else {
        handleDownloadMeme('png');
      }
    } catch {
      handleDownloadMeme('png');
    }
  };

  const handleSaveToGallery = () => {
    const canvas = memeCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const newSaved: SavedMeme = {
      id: `meme-${Date.now()}`,
      title: imageSourceTitle,
      dataUrl,
      topText,
      bottomText,
      layout: layoutStyle,
      filter: memeFilter,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSavedMemes((prev) => [newSaved, ...prev]);
    setExportStatus('Saved to Gallery');
    setTimeout(() => setExportStatus(null), 2500);
  };

  const categories = ['All', ...Array.from(new Set(TRENDING_TEMPLATES.map((t) => t.category)))];
  const filteredTemplates =
    templateCategory === 'All'
      ? TRENDING_TEMPLATES
      : TRENDING_TEMPLATES.filter((t) => t.category === templateCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-zinc-950">
      {/* Mandatory 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 lg:px-10 py-4 bg-[#FBFBF9]/95 backdrop-blur-sm border-b border-zinc-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio"
          className="font-display text-xl font-extrabold tracking-tight text-zinc-950 whitespace-nowrap shrink-0"
        >
          Punchline Studio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
          <a
            href="#text-to-meme"
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Text to Meme
          </a>
          <a
            href="#studio"
            onClick={() => setActiveAiTab('magic-captions')}
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Meme Studio
          </a>
          <a
            href="#templates"
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Templates
          </a>
          <a
            href="#gallery"
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Saved Gallery
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => handleDownloadMeme('jpg')}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Export Meme JPG
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Baseline) */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-12">
        {/* Editorial Intro Strip */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-zinc-500">
              Visual Comedy Engine · Gemini 3.8 Flash (Free Tier) · Text-to-Meme & Live Filters
            </p>
            <h1
              className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950"
              style={{ textWrap: 'balance' }}
            >
              Create memes from a single prompt, a template, or your own photo.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-900 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-zinc-700" />
              Upload Photo
            </button>
            <button
              onClick={() => {
                setActiveAiTab('magic-captions');
                handleGenerateMagicCaptions();
              }}
              disabled={isGeneratingCaptions}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Wand2 className={`w-4 h-4 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
              {isGeneratingCaptions ? 'Analyzing Scene...' : 'Magic Caption (5 Ideas)'}
            </button>
          </div>
        </section>

        {/* NEW: Instant Text-to-Meme Generator Bar (No Image Upload Required) */}
        <section
          id="text-to-meme"
          className="rounded-2xl bg-white border border-zinc-200 p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <Zap className="w-3.5 h-3.5" />
                <span>No Image Needed · Instant Text-to-Meme Generator</span>
              </div>
              <h2 className="font-display text-lg font-bold text-zinc-950">
                Describe any funny situation—AI draws the scene and overlays 5 punchlines
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              Powered by Free Gemini 3.8 Flash
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={textToMemeTopic}
              onChange={(e) => setTextToMemeTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGeneratingTextToMeme) {
                  handleGenerateTextToMeme();
                }
              }}
              placeholder="e.g., Pretending to understand the legacy codebase on my first day as a developer..."
              className="flex-1 px-4 py-3 text-sm bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-950"
            />
            <button
              onClick={() => handleGenerateTextToMeme()}
              disabled={isGeneratingTextToMeme}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-amber-400 ${isGeneratingTextToMeme ? 'animate-spin' : ''}`} />
              {isGeneratingTextToMeme
                ? 'Creating Scene & 5 Captions...'
                : 'Generate Full Meme from Text'}
            </button>
          </div>

          {/* Quick 1-Click Starter Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-zinc-500 mr-1">Try an idea:</span>
            {TEXT_TO_MEME_TOPICS.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTextToMemeTopic(idea);
                  handleGenerateTextToMeme(idea);
                }}
                disabled={isGeneratingTextToMeme}
                className="px-3 py-1.5 text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors truncate max-w-xs sm:max-w-md cursor-pointer"
              >
                “{idea}”
              </button>
            ))}
          </div>

          {textToMemeError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{textToMemeError}</span>
            </div>
          )}
        </section>

        {/* Primary Studio Workspace: 12-Column Split */}
        <section id="studio" ref={studioRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Live Canvas Stage + Meme Filter Bar + Typography Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Dark Studio Framing Stage */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={`relative rounded-2xl bg-zinc-950 p-4 sm:p-6 border transition-colors ${
                isDraggingOver ? 'border-rose-500 bg-zinc-900' : 'border-zinc-800'
              }`}
            >
              {/* Stage Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">{imageSourceTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Filter: {MEME_FILTERS.find((f) => f.id === memeFilter)?.label || 'Original'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isCropping) {
                        setCropX(10);
                        setCropY(10);
                        setCropW(80);
                        setCropH(80);
                      }
                      setIsCropping(!isCropping);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCropping
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <Crop className="w-3.5 h-3.5" />
                    {isCropping ? 'Exit Crop' : 'Crop Image'}
                  </button>
                  {previousImageSrc && (
                    <button
                      onClick={() => {
                        setBaseImageSrc(previousImageSrc);
                        setPreviousImageSrc(null);
                        setIsCropping(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo Image Change
                    </button>
                  )}
                  {exportStatus && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      {exportStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Crop Stage OR Live High-Resolution HTML5 Canvas */}
              {isCropping ? (
                <div className="space-y-4 bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Crop className="w-4 h-4 text-rose-500" />
                      <span className="font-semibold text-white">Interactive Image Cropper</span>
                      <span>· Drag box or use aspect presets</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['free', '1:1', '4:3', '16:9', '3:4'] as const).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => applyCropPreset(preset)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors cursor-pointer uppercase"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Visual Crop Viewport */}
                  <div className="flex items-center justify-center bg-zinc-950 rounded-lg p-3 overflow-hidden">
                    <div
                      ref={cropContainerRef}
                      onMouseMove={(e) => {
                        if (!isDraggingCrop || !cropDragStartRef.current || !cropContainerRef.current)
                          return;
                        const rect = cropContainerRef.current.getBoundingClientRect();
                        if (!rect.width || !rect.height) return;
                        const dxPct = ((e.clientX - cropDragStartRef.current.clientX) / rect.width) * 100;
                        const dyPct = ((e.clientY - cropDragStartRef.current.clientY) / rect.height) * 100;
                        const nextX = Math.max(
                          0,
                          Math.min(100 - cropW, Math.round(cropDragStartRef.current.startX + dxPct))
                        );
                        const nextY = Math.max(
                          0,
                          Math.min(100 - cropH, Math.round(cropDragStartRef.current.startY + dyPct))
                        );
                        setCropX(nextX);
                        setCropY(nextY);
                      }}
                      onMouseUp={() => setIsDraggingCrop(false)}
                      onMouseLeave={() => setIsDraggingCrop(false)}
                      className="relative inline-block max-w-full max-h-[440px] select-none"
                    >
                      <img
                        src={baseImageSrc}
                        alt="Crop preview"
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="max-w-full max-h-[440px] w-auto h-auto block opacity-40 rounded"
                      />
                      {/* Highlighted Crop Window */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsDraggingCrop(true);
                          cropDragStartRef.current = {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            startX: cropX,
                            startY: cropY,
                          };
                        }}
                        style={{
                          left: `${cropX}%`,
                          top: `${cropY}%`,
                          width: `${cropW}%`,
                          height: `${cropH}%`,
                        }}
                        className="absolute border-2 border-rose-500 bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move flex items-center justify-center"
                      >
                        {/* Rule of thirds grid lines */}
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none">
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-white/30" />
                          <div className="border-r border-white/30" />
                          <div />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precision Crop Sliders */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-300">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>X Offset</span>
                        <span className="font-mono-tabular">{cropX}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, 100 - cropW)}
                        value={cropX}
                        onChange={(e) => setCropX(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Y Offset</span>
                        <span className="font-mono-tabular">{cropY}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, 100 - cropH)}
                        value={cropY}
                        onChange={(e) => setCropY(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Width</span>
                        <span className="font-mono-tabular">{cropW}%</span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={100}
                        value={cropW}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          setCropW(w);
                          if (cropX + w > 100) setCropX(100 - w);
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Height</span>
                        <span className="font-mono-tabular">{cropH}%</span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={100}
                        value={cropH}
                        onChange={(e) => {
                          const h = Number(e.target.value);
                          setCropH(h);
                          if (cropY + h > 100) setCropY(100 - h);
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => setIsCropping(false)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCrop}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply Crop to Meme
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Actual High-Resolution HTML5 Canvas */}
              <div
                className={`${
                  isCropping ? 'hidden' : 'flex'
                } items-center justify-center min-h-[360px] sm:min-h-[440px] bg-zinc-900/60 rounded-xl overflow-hidden p-2`}
              >
                <canvas
                  ref={memeCanvasRef}
                  className="max-w-full max-h-[540px] w-auto h-auto rounded-lg shadow-lg object-contain"
                />
              </div>

              {/* NEW: Live Meme Filter Strip directly inside the Studio Stage */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Meme Filter</span>
                  </div>

                  {memeFilter !== 'none' && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">
                        Intensity:{' '}
                        <span className="font-mono-tabular text-zinc-200 font-semibold">
                          {filterIntensity}%
                        </span>
                      </span>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={filterIntensity}
                        onChange={(e) => setFilterIntensity(Number(e.target.value))}
                        className="w-28 accent-rose-500 cursor-pointer"
                      />
                      <button
                        onClick={() => setMemeFilter('none')}
                        className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {MEME_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setMemeFilter(f.id)}
                      title={f.desc}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        memeFilter === f.id
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Stage Action Bar */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                {/* Layout Segmented Switcher */}
                <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg">
                  {(
                    [
                      { id: 'classic-split', label: 'Classic Split' },
                      { id: 'modern-header', label: 'White Header' },
                      { id: 'cinema-sub', label: 'Cinema Sub' },
                      { id: 'center-punch', label: 'Center' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLayoutStyle(item.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        layoutStyle === item.id
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Export / Save Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveToGallery}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    onClick={handleCopyMemeToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownloadMeme('png')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PNG
                  </button>
                  <button
                    onClick={() => handleDownloadMeme('jpg')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JPG
                  </button>
                </div>
              </div>
            </div>

            {/* Caption & Typography Controls Panel */}
            <div className="rounded-2xl bg-white p-6 border border-zinc-200 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-zinc-700" />
                  <h2 className="font-display text-base font-bold text-zinc-950">
                    Caption Overlay & Typography
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prevTop = topText;
                      setTopText(bottomText);
                      setBottomText(prevTop);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Swap Lines
                  </button>
                  <button
                    onClick={() => {
                      setTopText('');
                      setBottomText('');
                      setFullCaption('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Clear Text
                  </button>
                </div>
              </div>

              {layoutStyle === 'modern-header' || layoutStyle === 'cinema-sub' ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    {layoutStyle === 'modern-header'
                      ? 'Header Caption Text'
                      : 'Cinema Subtitle Line'}
                  </label>
                  <textarea
                    rows={2}
                    value={fullCaption}
                    onChange={(e) => setFullCaption(e.target.value)}
                    placeholder="Type your caption or click a Magic Caption on the right..."
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Top Text (Setup)
                    </label>
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="TOP CAPTION..."
                      className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Bottom Text (Punchline)
                    </label>
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="BOTTOM PUNCHLINE..."
                      className="w-full px-3.5 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}

              {/* Font Family, Size, Stroke & Color Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-zinc-100">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-600">Font Face</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as MemeFontFamily)}
                    className="w-full px-3 py-2 text-xs font-medium bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                  >
                    <option value="Anton">Anton (Classic Impact)</option>
                    <option value="Bricolage Grotesque">Bricolage Grotesque</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>Font Size</span>
                    <span className="font-mono-tabular font-semibold text-zinc-900">
                      {fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={68}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>Outline Stroke</span>
                    <span className="font-mono-tabular font-semibold text-zinc-900">
                      {strokeWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-600">
                    Text Color & Case
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {['#FFFFFF', '#FACC15', '#38BDF8', '#FB7185'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setTextColor(hex)}
                          aria-label={`Select color ${hex}`}
                          style={{ backgroundColor: hex }}
                          className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                            textColor === hex
                              ? 'border-zinc-950 scale-110 ring-2 ring-zinc-900/20'
                              : 'border-zinc-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllCaps(!allCaps)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        allCaps
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      CAPS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: AI Comedy & Visual Intelligence Suite */}
          <div className="lg:col-span-5 rounded-2xl bg-white border border-zinc-200 p-6 space-y-6">
            {/* Segmented Mode Control */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl">
              <button
                onClick={() => setActiveAiTab('magic-captions')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeAiTab === 'magic-captions'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-rose-600" />
                Magic Captions
              </button>
              <button
                onClick={() => setActiveAiTab('ai-image-lab')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeAiTab === 'ai-image-lab'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Create & Edit
              </button>
              <button
                onClick={() => setActiveAiTab('scene-analyzer')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeAiTab === 'scene-analyzer'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <ScanEye className="w-3.5 h-3.5 text-zinc-700" />
                Analyze Photo
              </button>
            </div>

            {/* TAB 1: MAGIC CAPTIONS */}
            {activeAiTab === 'magic-captions' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-zinc-950">
                    Magic Caption Generator
                  </h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Gemini Flash (free model) inspects the visual context of your image and writes 5 tailored captions. Click any suggestion below to overlay it immediately.
                  </p>
                </div>

                {/* Tone & Topic Controls */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Comedy Tone
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {HUMOR_TONES.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setHumorTone(tone)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            humorTone === tone
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Optional Situation or Topic Hint
                    </label>
                    <input
                      type="text"
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                      placeholder="e.g., Monday standup meeting, group project, finals week..."
                      className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <button
                    onClick={handleGenerateMagicCaptions}
                    disabled={isGeneratingCaptions}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                  >
                    <Wand2 className={`w-4 h-4 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
                    {isGeneratingCaptions
                      ? 'Gemini Flash Is Analyzing Image & Writing...'
                      : 'Generate 5 Fresh Magic Captions'}
                  </button>
                </div>

                {captionError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{captionError}</span>
                  </div>
                )}

                {/* Visual Context Readout */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-800">Scene Context Detected</span>
                    <span>Gemini 3.8 Flash</span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">{sceneSummary}</p>
                </div>

                {/* 5 Clickable Caption Suggestions */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-900">
                      5 Click-to-Overlay Captions
                    </span>
                    <span>Click any card to apply</span>
                  </div>

                  <div className="space-y-2">
                    {captionsList.map((cap, index) => {
                      const isSelected = activeCaptionId === cap.id;
                      return (
                        <button
                          key={cap.id}
                          onClick={() => handleApplyCaption(cap)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between text-xs mb-1 ${
                              isSelected ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            <span>
                              0{index + 1}. {cap.angle}
                            </span>
                            <span className={isSelected ? 'text-rose-400 font-semibold' : ''}>
                              {isSelected ? 'Applied on Canvas' : 'Apply Caption'}
                            </span>
                          </div>

                          {layoutStyle === 'modern-header' || layoutStyle === 'cinema-sub' ? (
                            <p className="text-xs font-semibold leading-snug">
                              {cap.fullCaption}
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold tracking-wide uppercase">
                                “{cap.topText}”
                              </p>
                              <p
                                className={`text-xs font-medium uppercase ${
                                  isSelected ? 'text-zinc-300' : 'text-zinc-600'
                                }`}
                              >
                                “{cap.bottomText}”
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI IMAGE LAB (Create & Edit without uploading) */}
            {activeAiTab === 'ai-image-lab' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-zinc-950">
                    AI Meme Image Studio
                  </h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Generate a brand-new meme image from scratch without uploading any photo, or remix the current image on your canvas with a text prompt.
                  </p>
                </div>

                {/* Create vs Edit Switcher */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-lg">
                  <button
                    onClick={() => {
                      setImageLabMode('create');
                      setImageLabError(null);
                      setImageLabSuccess(null);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      imageLabMode === 'create'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Create New Image
                  </button>
                  <button
                    onClick={() => {
                      setImageLabMode('edit');
                      setImageLabError(null);
                      setImageLabSuccess(null);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      imageLabMode === 'edit'
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    Edit Current Image
                  </button>
                </div>

                {imageLabMode === 'create' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700">
                        Describe the Meme Scene to Generate
                      </label>
                      <textarea
                        rows={3}
                        value={createPrompt}
                        onChange={(e) => setCreatePrompt(e.target.value)}
                        placeholder="e.g., A dramatic golden retriever wearing a detective trench coat examining an empty treat jar with a magnifying glass..."
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    {/* Aspect Ratio & Resolution */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-zinc-600">
                          Aspect Ratio
                        </label>
                        <select
                          value={genAspectRatio}
                          onChange={(e) => setGenAspectRatio(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium bg-zinc-50 border border-zinc-300 rounded-lg"
                        >
                          <option value="4:3">4:3 (Standard Meme)</option>
                          <option value="1:1">1:1 (Square Social)</option>
                          <option value="16:9">16:9 (Widescreen)</option>
                          <option value="3:4">3:4 (Vertical Portrait)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-zinc-600">
                          Resolution
                        </label>
                        <select
                          value={genImageSize}
                          onChange={(e) => setGenImageSize(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium bg-zinc-50 border border-zinc-300 rounded-lg"
                        >
                          <option value="1K">1K Crisp</option>
                          <option value="2K">2K High-Detail</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={handleCreateAiImage}
                        disabled={isProcessingImage || isGeneratingTextToMeme}
                        className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {isProcessingImage ? 'Generating Scene...' : 'Generate Image Only'}
                      </button>

                      <button
                        onClick={() => handleGenerateTextToMeme(createPrompt)}
                        disabled={isProcessingImage || isGeneratingTextToMeme}
                        className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isGeneratingTextToMeme ? 'Building Meme...' : 'Image + 5 Captions'}
                      </button>
                    </div>

                    {/* Prompt Starters */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <span className="block text-xs font-semibold text-zinc-700">
                        Try a Comedy Scene Prompt
                      </span>
                      <div className="space-y-1.5">
                        {PROMPT_STARTERS.map((starter, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCreatePrompt(starter)}
                            className="w-full text-left p-2.5 text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
                          >
                            {starter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700">
                        How Should Gemini Edit "{imageSourceTitle}"?
                      </label>
                      <textarea
                        rows={3}
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., Add a tiny royal crown and dramatic laser eyes, or put them in a medieval castle..."
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <button
                      onClick={handleEditAiImage}
                      disabled={isProcessingImage}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isProcessingImage
                        ? 'Editing Image...'
                        : 'Apply AI Edit to Current Image'}
                    </button>

                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <span className="block text-xs font-semibold text-zinc-700">
                        One-Click Edit Ideas
                      </span>
                      <div className="space-y-1.5">
                        {EDIT_STARTERS.map((idea, idx) => (
                          <button
                            key={idx}
                            onClick={() => setEditPrompt(idea)}
                            className="w-full text-left p-2.5 text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
                          >
                            {idea}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {imageLabError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{imageLabError}</span>
                  </div>
                )}

                {imageLabSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-900">
                    <p className="font-medium">{imageLabSuccess}</p>
                    <button
                      onClick={() => {
                        setActiveAiTab('magic-captions');
                        handleGenerateMagicCaptions();
                      }}
                      className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 underline underline-offset-4 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Generate 5 Magic Captions for this new image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DEEP IMAGE UNDERSTANDING (gemini-3.8-flash) */}
            {activeAiTab === 'scene-analyzer' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold text-zinc-950">
                    Gemini Flash Image Understanding
                  </h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Upload any photo or inspect the current template. Gemini 3.8 Flash (free tier) analyzes facial micro-expressions, ironic details, and comedic potential.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Ask Anything About This Image (Optional)
                    </label>
                    <input
                      type="text"
                      value={analyzerQuestion}
                      onChange={(e) => setAnalyzerQuestion(e.target.value)}
                      placeholder="e.g., What makes the expression funny? What details are in the background?"
                      className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAnalyzeScene}
                      disabled={isAnalyzingScene}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                    >
                      <ScanEye className="w-4 h-4" />
                      {isAnalyzingScene
                        ? 'Analyzing with Gemini Flash...'
                        : 'Analyze Image with Gemini Flash'}
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>

                {analyzerError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{analyzerError}</span>
                  </div>
                )}

                {deepAnalysis ? (
                  <div className="space-y-3 pt-2 border-t border-zinc-100 text-xs">
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                      <span className="font-semibold text-zinc-900">
                        Meme Archetype: {deepAnalysis.memeArchetype}
                      </span>
                      <p className="text-zinc-700 leading-relaxed">
                        {deepAnalysis.visualBreakdown}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                      <span className="font-semibold text-zinc-900">
                        Emotional & Comedic Tension
                      </span>
                      <p className="text-zinc-700 leading-relaxed">
                        {deepAnalysis.emotionalTone}
                      </p>
                    </div>

                    {deepAnalysis.useCases?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-semibold text-zinc-900">
                          Click a Scenario to Use as Caption:
                        </span>
                        <div className="space-y-1.5">
                          {deepAnalysis.useCases.map((scenario, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setLayoutStyle('modern-header');
                                setFullCaption(scenario);
                              }}
                              className="w-full text-left p-3 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                            >
                              0{idx + 1}. {scenario}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
                    <p className="text-xs font-medium text-zinc-700">
                      Ready to inspect "{imageSourceTitle}"
                    </p>
                    <p className="text-xs text-zinc-500">
                      Click "Analyze Image with Gemini Flash" above for a full breakdown of visual elements, mood, and reaction scenarios.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Trending Meme Templates Catalog */}
        <section id="templates" className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Layers className="w-3.5 h-3.5" />
                <span>Curated Reaction Library · Instant Magic Captions Included</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-zinc-950">
                Trending Meme Templates
              </h2>
            </div>

            {/* Interactive Category Filter Control */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    templateCategory === cat
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isCurrent = selectedTemplate.id === template.id && imageSourceTitle === template.title;
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`group rounded-2xl bg-white border transition-all overflow-hidden flex flex-col cursor-pointer ${
                    isCurrent
                      ? 'border-zinc-950 ring-2 ring-zinc-950/10'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="aspect-4/3 w-full bg-zinc-900 overflow-hidden relative">
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Zero-Pill Metadata Discipline: Clean unboxed text with typographic separators */}
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{template.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{template.aspectRatioLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {template.precomputedCaptions.length} Captions
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-zinc-950">
                        {template.title}
                      </h3>
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold">
                      <span className={isCurrent ? 'text-rose-600' : 'text-zinc-900'}>
                        {isCurrent ? 'Loaded in Studio' : 'Use Template in Studio'}
                      </span>
                      <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Saved Memes Gallery */}
        <section id="gallery" className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Session Archive</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{savedMemes.length} Saved</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-zinc-950">
                Your Saved Memes
              </h2>
            </div>
            {savedMemes.length > 0 && (
              <button
                onClick={() => setSavedMemes([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-rose-600 bg-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Archive
              </button>
            )}
          </div>

          {savedMemes.length === 0 ? (
            <div className="rounded-2xl bg-white border border-zinc-200 p-10 text-center max-w-xl mx-auto space-y-3">
              <h3 className="font-display text-base font-bold text-zinc-950">
                No saved memes yet
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Type a topic in the Text-to-Meme bar or pick a template above, apply a meme filter, and press "Save" on the canvas toolbar to keep your favorites here.
              </p>
              <button
                onClick={handleSaveToGallery}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save Current Canvas Meme
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedMemes.map((meme) => (
                <div
                  key={meme.id}
                  className="rounded-2xl bg-white border border-zinc-200 overflow-hidden flex flex-col"
                >
                  <div className="bg-zinc-950 p-3 flex items-center justify-center aspect-4/3">
                    <img
                      src={meme.dataUrl}
                      alt={meme.title}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 truncate">{meme.title}</p>
                      <p className="text-xs text-zinc-500 font-mono-tabular">
                        Saved at {meme.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDownloadSavedMeme(meme, 'png')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        PNG
                      </button>
                      <button
                        onClick={() => handleDownloadSavedMeme(meme, 'jpg')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        JPG
                      </button>
                      <button
                        onClick={() =>
                          setSavedMemes((prev) => prev.filter((m) => m.id !== meme.id))
                        }
                        aria-label="Delete saved meme"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-zinc-200 py-6 px-6 lg:px-10 text-xs text-zinc-500">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Punchline Studio · AI Meme & Visual Comedy Workspace</span>
          <div className="flex items-center gap-4">
            <a href="#text-to-meme" className="hover:text-zinc-900 transition-colors">
              Text to Meme
            </a>
            <span aria-hidden="true">·</span>
            <a href="#studio" className="hover:text-zinc-900 transition-colors">
              Studio Canvas
            </a>
            <span aria-hidden="true">·</span>
            <a href="#templates" className="hover:text-zinc-900 transition-colors">
              Templates
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
