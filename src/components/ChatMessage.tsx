
import React from 'react';
import ReactMarkdown from 'react-markdown';
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
          {isUser ? (
            message.content
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="bg-black/20 rounded-md p-2 my-2 overflow-x-auto">
                      <pre {...props} />
                    </div>
                  ),
                  code: ({ node, className, children, ...props }) => (
                    <code className="bg-black/30 rounded px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
