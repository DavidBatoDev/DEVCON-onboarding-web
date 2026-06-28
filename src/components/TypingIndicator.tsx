import React from "react";

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-secondary border border-border text-foreground">
        D
      </div>
      <div className="flex h-8 items-center">
        <div className="typing-dots flex items-center" aria-label="DEBBIE is typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
