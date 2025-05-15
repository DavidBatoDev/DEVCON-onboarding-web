
import { Message } from '@/components/ChatMessage';

// Simulated delay for bot responses
const RESPONSE_DELAY_MS = 1500;

// Sample responses for the bot to cycle through
const sampleResponses = [
  `I'm DEVCON AI assistant. I can help you learn about DEVCON, the Philippines' largest nonprofit volunteer tech community, and answer your questions about our initiatives, chapters, and tech-related topics.

\`\`\`javascript
// Join our community with a simple function call
function joinDEVCON(name, email, skills) {
  return "Welcome to DEVCON, " + name + "! We're excited to have you join our community.";
}
\`\`\``,

  "For 15 years, DEVCON has been uniting and empowering IT students and professionals nationwide. Our broad chapter reach enables unique collaboration, empowering the tech ecosystem through impactful initiatives and a supportive environment for growth.",

  `DEVCON has several key initiatives you might be interested in:

1. **Tech Education** - Workshops and training for students
2. **Community Development** - Supporting local tech ecosystems
3. **Women in Tech** - Programs to encourage gender diversity
4. **Environmental Tech** - Using technology for sustainability
5. **Youth Development** - Mentorship for young tech enthusiasts`,

  `Here's how you can get involved with DEVCON:

\`\`\`
1. Join a local chapter
2. Volunteer for events
3. Become a mentor
4. Participate in hackathons
5. Attend our annual conference
\`\`\``,

  "DEVCON is the Philippines' largest non-profit volunteer tech community. From kids to campus to educators and women in tech, our inclusive programs ensure you have a space to learn and contribute to a technology-empowered Philippines. Join us in shaping the future of technology!"
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
