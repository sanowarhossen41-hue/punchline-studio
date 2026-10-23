<div align="center">

<img width="1200" height="475" alt="Google AI Studio" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

</div>



# Punchline Studio



AI-powered meme studio featuring Magic Captions and visual scene analysis with Gemini, plus custom meme image generation and editing.



View the original app in AI Studio: https://ai.studio/apps/97700a31-87f5-461b-9e77-3e01d04c47ee



## Run locally



**Prerequisite:** Node.js 18 or newer.



1. Install dependencies:
2. 
   ```bash
   
   npm install
   
   ```
   
2. Create `.env.local` from `.env.example` and set your Gemini API key:
3. 
   ```bash
   
   cp .env.example .env.local
   
   ```
   
3. Start the development server:
4. 
   ```bash
   
   npm run dev
   
   ```
   


The `GEMINI_API_KEY` must remain private. Do not commit real `.env` files or API keys. The repository ignores `.env*` except `.env.example`.













