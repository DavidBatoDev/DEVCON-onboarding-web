import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, ExternalLink } from 'lucide-react';
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
  isNewMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest, isNewMessage = false }) => {
  const isUser = message.role === 'user';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Function to render content with View Document buttons
  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          pre: ({ node, ...props }) => (
            <div className="bg-gray-800 rounded-lg p-4 my-3 overflow-x-auto">
              <pre {...props} className="text-gray-100 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed" />
            </div>
          ),
          code: ({ node, className, children, ...props }) => (
            <code className="bg-gray-700 text-gray-200 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
              {children}
            </code>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 my-3 space-y-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 my-3 space-y-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-200" {...props}>
              {children}
            </li>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-4 last:mb-0 text-gray-200" {...props}>
              {children}
            </p>
          ),
          a: ({ href, children, ...props }) => {
            const childText = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
            if (childText === 'View Document' || childText === '[View Document]') {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md no-underline"
                  {...props}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">View Document</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </a>
              );
            }
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          strong: ({ children, ...props }) => {
            return <strong className="font-semibold" {...props}>{children}</strong>;
          },
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-gray-100" {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0 text-gray-100" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-gray-100" {...props}>{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full mb-8 transition-all",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-4xl px-4",
        isUser ? "w-auto" : "w-full"
      )}>
        {/* Avatar and name section */}
        <div className={cn(
          "flex items-start",
          isUser ? "justify-end" : "space-x-4"
        )}>
          {/* Avatar - only for bot */}
          {!isUser && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-devcon-background text-white">
              D
            </div>
          )}
          
          {/* Content */}
          <div className={cn("min-w-0", isUser ? "w-auto" : "flex-1")}>
            <div className={cn(
              "mb-2 flex items-center",
              isUser ? "justify-end" : "justify-start"
            )}>
              <div className="font-medium text-gray-100">
                {isUser ? "You" : "DEBBIE"}
              </div>
              <div className="text-xs text-gray-400 ml-2">
                {formattedTime}
              </div>
            </div>
            
            <div className={cn(
              "text-base leading-7 text-gray-200",
              isUser ? "text-right" : "text-left"
            )}>
              {isUser ? (
                <div className="inline-block bg-devcon-purple text-white px-4 py-2 rounded-2xl rounded-tr-md max-w-xs md:max-w-md shadow-lg">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-gray-200">
                  {renderContent(message.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;