
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@/components/ChatMessage';

// Initialize the Gemini API with your API key
const API_KEY = "AIzaSyBa7k2BCQg4d-30fPRgmB79yv8sYzDG2Sk";
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model
const modelName = "gemini-1.5-flash";

// Generate a response using the Gemini API
export const generateBotResponse = async (userMessage: string): Promise<Message> => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: modelName });

    // Customize how the model should respond
    const systemPrompt = `You are DEVCON AI assistant. You help users learn about DEVCON, 
    the Philippines' largest nonprofit volunteer tech community. Respond in a friendly, 
    helpful manner and provide information about DEVCON's initiatives, chapters, and 
    tech-related topics. You may use markdown formatting in your responses.`;

    // Create a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Introduce yourself briefly" }],
        },
        {
          role: "model",
          parts: [{ text: systemPrompt }],
        },
      ],
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
