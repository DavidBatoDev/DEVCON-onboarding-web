// client/src/services/chatService.ts
import type {
  AskMetadata,
  IndexStats,
  RetrieveResponse,
  StreamEvent,
} from "@/types/chat";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Ensure the URL doesn't end with a slash to avoid double slashes
const getApiUrl = (endpoint: string) => {
  const baseUrl = BACKEND_URL.endsWith("/")
    ? BACKEND_URL.slice(0, -1)
    : BACKEND_URL;
  return `${baseUrl}${endpoint}`;
};

interface ChatHistory {
  role: string;
  content: string;
}

interface ServerStatus {
  server_up: boolean;
  server_running: boolean;
  message: string;
}

export const checkServerStatus = async (): Promise<ServerStatus> => {
  const response = await fetch(getApiUrl("/api/v1/status"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Streaming ask against the v2 NDJSON protocol, with a transparent fallback
 * for the legacy plain-text protocol: if the stream isn't line-JSON, the raw
 * text is forwarded as `legacy-token` events.
 */
export const streamMessageToBot = async (
  message: string,
  history: ChatHistory[] = [],
  onEvent: (evt: StreamEvent) => void,
  signal?: AbortSignal,
  nocache = false
): Promise<void> => {
  const response = await fetch(getApiUrl("/api/v1/ask/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify({ query: message, history, structured: true, nocache }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let legacyMode = false;
  let firstChunkSeen = false;

  const emitLines = (flush = false) => {
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        onEvent(JSON.parse(line) as StreamEvent);
      } catch {
        // Not JSON after all — treat the rest of the stream as legacy text.
        legacyMode = true;
        onEvent({ type: "legacy-token", text: line + "\n" });
      }
    }
    if (flush && buffer.trim()) {
      try {
        onEvent(JSON.parse(buffer) as StreamEvent);
      } catch {
        onEvent({ type: "legacy-token", text: buffer });
      }
      buffer = "";
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;

    if (!firstChunkSeen) {
      firstChunkSeen = true;
      // Sniff: legacy backends emit prose, not one JSON object per line.
      if (!chunk.trimStart().startsWith("{")) {
        legacyMode = true;
      }
    }
    if (legacyMode) {
      onEvent({ type: "legacy-token", text: chunk });
    } else {
      buffer += chunk;
      emitLines();
    }
  }
  const tail = decoder.decode();
  if (legacyMode) {
    if (tail) onEvent({ type: "legacy-token", text: tail });
  } else {
    buffer += tail;
    emitLines(true);
  }
};

export const sendMessageToBot = async (
  message: string,
  history: ChatHistory[] = [],
  nocache = false
): Promise<{ answer: string; metadata: AskMetadata | null }> => {
  const response = await fetch(getApiUrl("/api/v1/ask"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: message,
      history,
      structured: true,
      nocache,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const sendFeedback = async (
  requestId: string,
  rating: "up" | "down",
  query?: string
): Promise<void> => {
  await fetch(getApiUrl("/api/v1/feedback"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: requestId, rating, query }),
  });
};

export const retrieveDebug = async (
  query: string,
  topK?: number
): Promise<RetrieveResponse> => {
  const response = await fetch(getApiUrl("/api/v1/retrieve"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getIndexStats = async (): Promise<IndexStats> => {
  const response = await fetch(getApiUrl("/api/v1/stats"));
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
