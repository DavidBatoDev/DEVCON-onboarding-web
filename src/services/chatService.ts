
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@/components/ChatMessage';

// Initialize the Gemini API with your API key
const API_KEY = "AIzaSyBa7k2BCQg4d-30fPRgmB79yv8sYzDG2Sk";
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model
const modelName = "gemini-1.5-flash";

interface ChatMemory {
  userName?: string;
  userData: Record<string, any>;
  lastInteraction: Date;
  messages: Message[];
}

// Generate a response using the Gemini API
export const generateBotResponse = async (userMessage: string, memory?: ChatMemory): Promise<Message> => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Customize how the model should respond based on memory
    let systemPrompt = `You are DEVCON AI assistant. You help users learn about DEVCON, 
    the Philippines' largest nonprofit volunteer tech community. Respond in a friendly, 
    helpful manner and provide information about DEVCON's initiatives, chapters, and 
    tech-related topics. You may use markdown formatting in your responses.`;
    
    // Add memory context if available
    if (memory?.userName) {
      systemPrompt += ` The user's name is ${memory.userName}. Remember this and refer to them by name occasionally.`;
    }

    // Create a chat history for context
    const chatHistory = [];
    
    // Initialize with system prompt
    chatHistory.push({
      role: "user",
      parts: [{ text: "Introduce yourself briefly" }],
    });
    
    chatHistory.push({
      role: "model",
      parts: [{ text: systemPrompt }],
    });
    
    // Add previous messages from memory to provide context, limiting to the last 10
    if (memory?.messages && memory.messages.length > 0) {
      const recentMessages = memory.messages.slice(-10); // Get only the last 10 messages
      
      recentMessages.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Create a chat session with context
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Send the message and get a response
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    // Create a bot response
    return {
      id: `bot-${Date.now()}`,
      content: text,
      role: 'assistant',
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error generating response:", error);
    
    // Return an error message if something goes wrong
    return {
      id: `bot-error-${Date.now()}`,
      content: "Sorry, I encountered an error connecting to my AI brain. Please try again later.",
      role: 'assistant',
      timestamp: new Date()
    };
  }
};
