import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import DevconLogo from "./DevconLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { sendMessageToBot, checkServerStatus } from "@/services/chatService";

const SUGGESTED_PROMPTS = [
  "What's on the new officer onboarding checklist?",
  "How do I plan my chapter's first event?",
  "Which tools should our chapter use to stay organized?",
  "Share best practices for growing chapter membership",
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [isServerUp, setIsServerUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check server status on first render only
  useEffect(() => {
    const checkServerStatusInBackground = async () => {
      try {
        console.log("Checking server status", isServerUp);
        // await checkServerStatus();
        await new Promise((resolve) => setTimeout(resolve, 30000));
        setIsServerUp(true);
        // setIsServerUp(true);
      } catch (error) {
        console.error("Server is not available:", error);
        setIsServerUp(false);
      }
    };

    // Initial check only
    checkServerStatusInBackground();
  }, []); // Empty dependency array - only runs on first render

  // Monitor isServerUp changes
  useEffect(() => {
    console.log("isServerUp changed to:", isServerUp);
  }, [isServerUp]);

  // Load saved messages on mount
  useEffect(() => {
    const saved = localStorage.getItem("devcon-chat-history");
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    localStorage.setItem("devcon-chat-history", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Helper function to get conversation history for context
  const getConversationHistory = (): Array<{
    role: string;
    content: string;
  }> => {
    // Get last 10 messages for context
    const recentMessages = messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log(recentMessages);

    return recentMessages;
  };

  const processMessage = async (
    text: string,
    history: Array<{ role: string; content: string }>
  ) => {
    try {
      const data = await sendMessageToBot(text, history);

      const botMessageId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMessageId,
        role: "assistant",
        content: data.answer || "⚠️ No answer provided.",
        timestamp: new Date(),
      };

      setLatestMessageId(botMessageId);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while contacting the bot.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Get conversation history for context
    const history = getConversationHistory();

    console.log("isServerUp when send message", isServerUp);

    if (!isServerUp) {
      // Show offline message immediately
      const offlineMessageId = `bot-${Date.now()}`;
      const offlineMessage: Message = {
        id: offlineMessageId,
        role: "assistant",
        content:
          "Hi! I'm still on beta and using available free credits while we testing the waters. I'm currently pulling the answer from the @[https://linktr.ee/fordevconchapterleads](https://linktr.ee/fordevconchapterleads) and HQ documents. Expect few minutes for a response!",
        timestamp: new Date(),
      };

      setLatestMessageId(offlineMessageId);
      setMessages((prev) => [...prev, offlineMessage]);

      // Send API request after 2 seconds
      setTimeout(async () => {
        try {
          await processMessage(text, history);
        } catch (error) {
          console.error("Failed to process message after delay:", error);
        }
      }, 2000);
    } else {
      // Server is up, process immediately
      await processMessage(text, history);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLatestMessageId(null);
    localStorage.removeItem("devcon-chat-history");
    toast({
      title: "Chat cleared.",
      description: "Your conversation history has been cleared.",
    });
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/devcon">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <DevconLogo />
          <div className="ml-1 hidden items-center gap-1.5 sm:flex">
            <span className="text-sm font-medium text-foreground">DEBBIE</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isServerUp ? "bg-emerald-500" : "bg-amber-500"
              }`}
              title={isServerUp ? "Online" : "Connecting…"}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          disabled={isEmpty}
          className="text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear chat</span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isEmpty && !isTyping ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Hi, I&apos;m DEBBIE
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
              Your DEVCON officer onboarding assistant. Ask me about checklists,
              guides, tools, and best practices for leading your chapter.
            </p>
            <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-ring/50 hover:bg-accent"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatest={idx === messages.length - 1}
                isNewMessage={msg.id === latestMessageId}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background px-4 py-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
      </div>
    </div>
  );
};

export default ChatInterface;
