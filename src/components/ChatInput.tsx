
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="relative flex flex-col w-full border-t border-border bg-card p-4">
      <div className="flex items-end gap-2">
        <Textarea
          className="min-h-10 max-h-36 resize-none bg-secondary border-secondary"
          placeholder="Send a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          size="icon"
          className="h-10 w-10 shrink-0 bg-devcon-purple hover:bg-devcon-purple/90"
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
