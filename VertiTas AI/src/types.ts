export interface FactCheck {
  claim: string;
  publisher: string;
  verdict: string;
  url?: string;
}

export interface AnalysisResult {
  label: "REAL" | "FAKE";
  confidence: number;
  explanation: string;
  summary?: string;
  suspiciousWords: string[];
  sourceCredibility: "Trusted" | "Suspicious" | "Unknown";
  sourceScore: number;
  factChecks: FactCheck[];
  factCheckApiEnabled?: boolean;
}

export interface AnalysisLog {
  id: string;
  userId: string;
  inputText: string;
  label: "REAL" | "FAKE";
  confidence: number;
  createdAt: string;
}
