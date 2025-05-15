
import React from 'react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const renderMarkdown = (content: string) => {
    return (
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div
      className={cn(
        "flex w-full mb-4 items-start",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[80%] md:max-w-[70%] rounded-lg p-4",
          isUser
            ? "bg-devcon-purple text-white rounded-tr-none"
            : "bg-secondary text-white rounded-tl-none"
        )}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="font-semibold">
            {isUser ? "You" : "DEVCON AI"}
          </div>
          <div className="text-xs opacity-70 ml-4">{formattedTime}</div>
        </div>
        <div className="text-sm">
          {isUser ? message.content : renderMarkdown(message.content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
