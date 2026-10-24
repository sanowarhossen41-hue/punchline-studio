# Punchline Studio



AI-powered meme studio featuring Gemini-powered captions and visual scene analysis, plus custom meme image generation and editing.



**Google AI Studio project:** [Open Punchline Studio in AI Studio](https://ai.studio/apps/97700a31-87f5-461b-9e77-3e01d04c47ee). Open it while signed in to the Google account that owns the app. The GitHub repository and releases are the source distribution for this project.



## Features



The editor supports meme templates, captions, image filters, crop controls, and local saving. Gemini captions, image analysis, and image generation/editing are handled by the Express API server.



## Run locally



Prerequisites: Node.js 20.19+ or 22.12+ (required by Vite 8). Install dependencies with `npm install`. Copy `.env.example` to `.env.local` and set your own `GEMINI_API_KEY`; never commit a real key or `.env.local`. Run `npm run dev` to start the Vite app and Express API server.



## Android APK



The latest Android package is published in [GitHub Releases](https://github.com/sanowarhossen41-hue/punchline-studio/releases/latest). GitHub Actions creates an installable, debug-signed APK using Capacitor.



**Important:** The APK currently bundles the app frontend only; it does not bundle the Express server or a Gemini API key. Meme editing and included templates are available, but Gemini generation and analysis actions require a separately hosted API backend and are not enabled in this APK yet. This is an installation/testing build, not a Play Store-signed production build.



The Android package is built by `.github/workflows/android-apk.yml`. For a local build, run `npm run build`, install `@capacitor/core@8.5.3`, `@capacitor/cli@8.5.3`, and `@capacitor/android@8.5.3` with npm, run `npx cap add android` once, then `npx cap sync android` and `cd android && ./gradlew assembleDebug`.
