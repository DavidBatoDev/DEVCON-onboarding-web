import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onStop }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-sm transition-colors focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/30">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          placeholder="Message DEBBIE…"
          rows={1}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {isLoading && onStop ? (
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={onStop}
            title="Stop generating"
          >
            <Square className="h-3.5 w-3.5" />
            <span className="sr-only">Stop</span>
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={handleSubmit}
            disabled={!canSend}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        DEBBIE can make mistakes. Press{" "}
        <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px] font-medium">
          Enter
        </kbd>{" "}
        to send,{" "}
        <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px] font-medium">
          Shift+Enter
        </kbd>{" "}
        for a new line.
      </p>
    </div>
  );
};

export default ChatInput;
