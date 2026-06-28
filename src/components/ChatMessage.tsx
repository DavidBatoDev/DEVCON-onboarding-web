import React from "react";
import ReactMarkdown from "react-markdown";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  isNewMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isNewMessage = false,
}) => {
  const isUser = message.role === "user";
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          pre: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border bg-secondary/50 p-4">
              <pre
                {...props}
                className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground"
              />
            </div>
          ),
          code: ({ node, className, children, ...props }) => (
            <code
              className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px] text-foreground"
              {...props}
            >
              {children}
            </code>
          ),
          ul: ({ children, ...props }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-foreground/90 marker:text-muted-foreground" {...props}>
              {children}
            </li>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-3 leading-7 text-foreground/90 last:mb-0" {...props}>
              {children}
            </p>
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-border" {...props} />
          ),
          a: ({ href, children, ...props }) => {
            const childText =
              typeof children === "string"
                ? children
                : Array.isArray(children)
                ? children.join("")
                : "";
            if (
              childText === "View Document" ||
              childText === "[View Document]"
            ) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-sm font-medium text-foreground no-underline transition-colors hover:bg-accent"
                  {...props}
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>View Document</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          h1: ({ children, ...props }) => (
            <h1
              className="mb-3 mt-5 text-2xl font-semibold tracking-tight text-foreground first:mt-0"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mb-2 mt-5 text-xl font-semibold tracking-tight text-foreground first:mt-0"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="mb-2 mt-4 text-lg font-semibold tracking-tight text-foreground first:mt-0"
              {...props}
            >
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (isUser) {
    return (
      <div
        className={cn("flex w-full justify-end", isNewMessage && "animate-fade-in")}
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 md:max-w-[75%]">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full gap-4", isNewMessage && "animate-fade-in")}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-secondary border border-border text-foreground">
        D
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">DEBBIE</span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
        <div className="markdown-content text-[15px] text-foreground/90">
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
