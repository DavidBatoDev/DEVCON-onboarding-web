import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import DevconLogo from "./DevconLogo";
import LoadingModal from "./LoadingModal";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { sendMessageToBot, checkServerStatus } from "@/services/chatService";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: [
      "**🎉 Hey there, Officer! 🎉**",
      "Welcome aboard the **DEBBIE — DEVCON Officer Onboarding Bot** — your cheerful sidekick on this exciting tech adventure! 💻✨",
      "",
      "I'm here to help you kickstart your journey with:",
      "- 📋 **Checklists** to keep you on track",
      "- 📚 **Guides and best practices**",
      "- 🛠️ **Tools** to lead your chapter smoothly",
      "- 🎯 **Tips** to turn ideas into action**",
      "",
      "So buckle up, future tech leader — your chapter is waiting, and I've got your back every step of the way.",
      "**Ready to roll? Let's do this! 🚀😄**",
      "",
      "---",
    ].join("\n"),
    timestamp: new Date(),
  };

  // Check server status on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await checkServerStatus();
        // Server is up, close the loading modal
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to connect to server:", error);
        toast({
          title: "Connection Error",
          description:
            "Unable to connect to the server. Please try again later.",
          variant: "destructive",
        });
        // Still close the modal even if there's an error
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  // Load saved messages on mount
  useEffect(() => {
    const saved = localStorage.getItem("devcon-chat-history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([welcomeMessage]);
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
    // Get last 10 messages (excluding welcome message) for context
    const recentMessages = messages
      .filter((msg) => msg.id !== "welcome")
      .slice(-10)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    return recentMessages;
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

    try {
      // Get conversation history for context
      const history = getConversationHistory();

      // Send message with history context
      const data = await sendMessageToBot(text, history);

      const botMessageId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMessageId,
        role: "assistant",
        content: data.answer || "⚠️ No answer provided.",
        timestamp: new Date(),
      };

      // Set this as the latest message to trigger typewriter
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

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setLatestMessageId(null);
    localStorage.removeItem("devcon-chat-history");
    toast({
      title: "Chat cleared.",
      description: "Your conversation history has been cleared.",
    });
  };

  return (
    <>
      <LoadingModal isOpen={isLoading} />
      <div className="flex flex-col h-screen bg-gradient-to-b from-devcon-background to-devcon-background/90">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border backdrop-blur-md bg-black/30 shadow-md">
          <div className="flex items-center gap-4">
            <Link
              to="/devcon"
              className="flex items-center text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <DevconLogo />
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors bg-black/20 px-3 py-1 rounded-full"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
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
        </div>

        <div className="bg-transparent py-4">
          <div className="w-full max-w-3xl mx-auto px-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
