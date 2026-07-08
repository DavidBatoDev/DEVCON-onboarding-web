// client/src/services/chatService.ts
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
  try {
    const response = await fetch(getApiUrl("/api/v1/status"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking server status:", error);
    throw error;
  }
};

export const streamMessageToBot = async (
  message: string,
  history: ChatHistory[] = [],
  onToken: (delta: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  const response = await fetch(getApiUrl("/api/v1/ask/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: message,
      history: history,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onToken(chunk);
  }
  // Flush any remaining bytes from the decoder.
  const tail = decoder.decode();
  if (tail) onToken(tail);
};

export const sendMessageToBot = async (
  message: string,
  history: ChatHistory[] = []
): Promise<{ answer: string }> => {
  try {
    const response = await fetch(getApiUrl("/api/v1/ask"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: message,
        history: history, // Include conversation history
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message to bot:", error);
    throw error;
  }
};
