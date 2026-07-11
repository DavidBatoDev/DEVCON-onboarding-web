// Shared API types for the v2 RAG backend contract.

export interface SourceRef {
  n: number;
  title: string;
  section: string;
  snippet: string;
  text: string;
  drive_link: string;
  score: number | null;
  chunk_id: string;
  cited: boolean;
}

export interface AskMetadata {
  grounded: boolean;
  confidence: "strong" | "weak" | "none";
  sources: SourceRef[];
  timings: Record<string, number>;
  model: string;
  request_id: string;
  kb_version: string;
  cached: boolean;
}

export type StreamEvent =
  | { type: "meta"; request_id: string; model: string; kb_version: string; cached: boolean }
  | { type: "sources"; grounded: boolean; confidence: AskMetadata["confidence"]; sources: SourceRef[] }
  | { type: "token"; text: string }
  | { type: "done"; answer: string; cited: number[]; timings: Record<string, number> }
  | { type: "error"; message: string }
  // Emitted locally by the client when the backend speaks the legacy
  // plain-text protocol (no structured events available).
  | { type: "legacy-token"; text: string };

export interface RetrieveCandidate {
  final_rank: number;
  chunk_id: string;
  title: string;
  section: string;
  text: string;
  cosine: number | null;
  bm25_rank: number | null;
  rrf: number;
}

export interface RetrieveResponse {
  query: string;
  tier: "strong" | "weak" | "none";
  thresholds: { strong: number; weak: number };
  candidates: RetrieveCandidate[];
}

export interface IndexStats {
  status: string;
  document_count: number;
  collection_name?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  top_k_retrieval?: number;
  embedding_model?: string;
  llm_model?: string;
  kb_version?: string;
  hybrid_search?: boolean;
  rerank_mode?: string;
  documents?: { title: string; chunk_count: number; sections: number }[];
}
