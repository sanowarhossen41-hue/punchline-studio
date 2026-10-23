export type MemeLayoutStyle =
  | 'classic-split'
  | 'modern-header'
  | 'cinema-sub'
  | 'center-punch';

export type MemeFontFamily =
  | 'Anton'
  | 'Bricolage Grotesque'
  | 'Plus Jakarta Sans'
  | 'JetBrains Mono';

export type MemeFilterType =
  | 'none'
  | 'deep-fried'
  | 'noir'
  | 'vhs-90s'
  | 'vaporwave'
  | 'sepia-vintage'
  | 'intense-red';

export interface MagicCaptionSuggestion {
  id: string;
  topText: string;
  bottomText: string;
  fullCaption: string;
  angle: string;
}

export interface MagicCaptionResult {
  sceneSummary: string;
  comedicPremise: string;
  recommendedLayout: MemeLayoutStyle;
  captions: MagicCaptionSuggestion[];
  modelUsed?: string;
}

export interface TextToMemeResult {
  sceneTitle: string;
  sceneSummary: string;
  comedicPremise: string;
  recommendedLayout: MemeLayoutStyle;
  imageUrl: string;
  captions: MagicCaptionSuggestion[];
  modelUsed?: string;
}

export interface DeepImageAnalysis {
  visualBreakdown: string;
  emotionalTone: string;
  memeArchetype: string;
  useCases: string[];
  modelUsed?: string;
}

export interface MemeTemplate {
  id: string;
  title: string;
  category: string;
  aspectRatioLabel: string;
  defaultLayout: MemeLayoutStyle;
  defaultTopText: string;
  defaultBottomText: string;
  defaultFullCaption: string;
  imageUrl: string;
  description: string;
  precomputedCaptions: MagicCaptionSuggestion[];
}

export interface SavedMeme {
  id: string;
  title: string;
  dataUrl: string;
  topText: string;
  bottomText: string;
  layout: MemeLayoutStyle;
  filter?: MemeFilterType;
  createdAt: string;
}
