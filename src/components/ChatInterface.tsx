
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { generateBotResponse } from '@/services/chatService';
import DevconLogo from './DevconLogo';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "👋 Hello! I'm DEVCON AI, your developer assistant. Ask me anything about DEVCON, our initiatives, or how you can get involved!",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from local storage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('devcon-chat-history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    }
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('devcon-chat-history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);

    try {
      // Get bot response using Gemini API
      const botResponse = await generateBotResponse(content);
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([{
      id: 'welcome',
      content: "👋 Hello! I'm DEVCON AI, your developer assistant. Ask me anything about DEVCON, our initiatives, or how you can get involved!",
      role: 'assistant',
      timestamp: new Date()
    }]);
    localStorage.removeItem('devcon-chat-history');
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-devcon-background">
      <header className="flex items-center justify-between p-4 border-b border-border backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <DevconLogo />
        </div>
        <div className="text-sm text-muted-foreground">AI Developer Assistant</div>
        <button 
          onClick={clearChatHistory}
          className="text-sm text-muted-foreground hover:text-white transition-colors"
        >
          Clear Chat
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-devcon-background to-devcon-background/90">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLatest={index === messages.length - 1}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="flex justify-center w-full border-t border-border backdrop-blur-sm bg-black/20">
        <div className="w-full max-w-4xl px-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
