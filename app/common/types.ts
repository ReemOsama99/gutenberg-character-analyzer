export interface BookMetadata {
  title: string;
  author: string;
  language: string;
  releaseDate: string;
  subjects: string[];
}

export interface AnalysisResult {
  summary: string;
  analysis: BookAnalysis;
  characters: Character[];
  relationships: Relationship[];
  rawOutput?: string; // Keep for debugging purposes
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: "family" | "friend" | "rival" | "romance" | "ally";
  description: string;
  significance: number;
}

export interface BookAnalysis {
  themes: string[];
  setting: string;
  timeframe: string;
}

export interface Book {
  text: string;
  metadata: BookMetadata;
  analysisResult: AnalysisResult;
}