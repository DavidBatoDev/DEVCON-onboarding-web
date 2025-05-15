
import { Message } from '@/components/ChatMessage';

// Simulated delay for bot responses
const RESPONSE_DELAY_MS = 1500;

// Sample responses for the bot to cycle through
const sampleResponses = [
  `I'm a simulated Gemini AI assistant. I can help you with coding questions, explain concepts, or assist with technical problems.

\`\`\`javascript
// Here's a sample code snippet
function greeting(name) {
  return \`Hello, \${name}! Welcome to DEVCON AI.\`;
}

console.log(greeting("Developer"));
\`\`\``,

  "The Gemini API is Google's multimodal AI model that can understand and generate text, images, and code. In this demo, I'm simulating responses, but the real Gemini API can create more dynamic and helpful content.",

  `Here are some popular programming languages you might be interested in:

1. **JavaScript/TypeScript** - For web development
2. **Python** - For data science and backend
3. **Rust** - For systems programming
4. **Go** - For cloud and network services
5. **Kotlin** - For Android development`,

  `Let me explain how you could structure a React component:

\`\`\`jsx
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};

export default Counter;
\`\`\``,

  "DEVCON is our developer community platform where we share knowledge, collaborate on projects, and stay updated with the latest in tech. This AI assistant is here to help you navigate resources and answer your questions."
];

// Get a random response from our sample responses
const getRandomResponse = (): string => {
  const index = Math.floor(Math.random() * sampleResponses.length);
  return sampleResponses[index];
};

export const generateBotResponse = async (userMessage: string): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY_MS));
  
  // Create a bot response
  return {
    id: `bot-${Date.now()}`,
    content: getRandomResponse(),
    role: 'assistant',
    timestamp: new Date()
  };
};
