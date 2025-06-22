// client/src/services/chatService.ts
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8001";

interface ChatHistory {
  role: string;
  content: string;
}

export const sendMessageToBot = async (
  message: string, 
  history: ChatHistory[] = []
): Promise<{ answer: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        history: history // Include conversation history
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to bot:', error);
    throw error;
  }
};
