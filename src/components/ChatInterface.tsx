import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import DevconLogo from "./DevconLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FlaskConical, Trash2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  sendMessageToBot,
  streamMessageToBot,
  checkServerStatus,
} from "@/services/chatService";
import type { StreamEvent } from "@/types/chat";

const SUGGESTED_PROMPTS = [
  "What's on the new officer onboarding checklist?",
  "How do I plan my chapter's first event?",
  "How do I apply for the DEVCON internship?",
  "Share best practices for growing chapter membership",
];

// v2: message shape gained sources/grounded/etc. — old saved histories lack
// them, so a clean key keeps parsing simple.
const STORAGE_KEY = "devcon-chat-history-v2";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [isServerUp, setIsServerUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Check real server status on mount (drives the header status dot)
  useEffect(() => {
    let cancelled = false;
    checkServerStatus()
      .then(() => {
        if (!cancelled) setIsServerUp(true);
      })
      .catch((error) => {
        console.error("Server is not available:", error);
        if (!cancelled) setIsServerUp(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load saved messages on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Helper function to get conversation history for context
  const getConversationHistory = (
    msgs: Message[]
  ): Array<{ role: string; content: string }> =>
    msgs.slice(-10).map((msg) => ({ role: msg.role, content: msg.content }));

  const patchMessage = (id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const processMessage = async (
    text: string,
    history: Array<{ role: string; content: string }>,
    nocache = false
  ) => {
    const botMessageId = `bot-${Date.now()}`;
    let created = false;
    let sawError: string | null = null;
    // `meta` arrives immediately (before retrieval); `sources`/`token` only
    // after retrieval + first token (~2-4s). We stash meta and DON'T create
    // the bubble yet, so the typing indicator stays up during that gap —
    // otherwise the user sees an empty bubble with a full action row.
    let pendingRequestId: string | undefined;
    // Sources/badge are stashed and only revealed on `done`, so the answer
    // streams first and all source UI appears together when it's complete.
    let pendingSources: Partial<Message> | undefined;

    const ensureBubble = () => {
      if (created) return;
      created = true;
      setIsTyping(false);
      setLatestMessageId(botMessageId);
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          requestId: pendingRequestId,
        },
      ]);
    };

    const onEvent = (evt: StreamEvent) => {
      switch (evt.type) {
        case "meta":
          // Keep the typing indicator; create the bubble on first content.
          pendingRequestId = evt.request_id;
          break;
        case "sources":
          // Stash — sources/badge are only revealed once the answer completes.
          pendingSources = {
            sources: evt.sources,
            grounded: evt.grounded,
            confidence: evt.confidence,
          };
          break;
        case "token":
        case "legacy-token":
          // First token creates the bubble; the answer streams on its own.
          ensureBubble();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId ? { ...m, content: m.content + evt.text } : m
            )
          );
          break;
        case "done":
          // Answer complete — swap in the sanitized text AND reveal sources +
          // badge together (so citation chips have targets to scroll to).
          ensureBubble();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: evt.answer || m.content,
                    ...(pendingSources ?? {}),
                  }
                : m
            )
          );
          break;
        case "error":
          sawError = evt.message;
          break;
      }
    };

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    try {
      await streamMessageToBot(text, history, onEvent, controller.signal, nocache);
      if (sawError) throw new Error(sawError);
      if (!created) {
        ensureBubble();
        patchMessage(botMessageId, { content: "⚠️ No answer provided." });
      }
    } catch (streamError) {
      if (controller.signal.aborted) {
        // User pressed stop — keep the partial answer, mark it.
        if (created) patchMessage(botMessageId, { stopped: true });
        return;
      }
      console.error("Streaming failed, falling back to non-streaming:", streamError);
      try {
        const data = await sendMessageToBot(text, history, nocache);
        ensureBubble();
        patchMessage(botMessageId, {
          content: data.answer || "⚠️ No answer provided.",
          sources: data.metadata?.sources,
          grounded: data.metadata?.grounded,
          confidence: data.metadata?.confidence,
          requestId: data.metadata?.request_id,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong while contacting the bot.",
          variant: "destructive",
        });
      }
    } finally {
      abortRef.current = null;
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Conversation history = prior turns, excluding the message being sent
    const history = getConversationHistory(messages);

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    await processMessage(text, history);
  };

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsTyping(false);
  }, []);

  const handleRegenerate = async () => {
    // Drop the trailing assistant message, resend the last user text (cache-busted).
    if (isTyping || isStreaming) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const last = messages[messages.length - 1];
    const trimmed =
      last?.role === "assistant"
        ? messages.slice(0, -1)
        : messages;
    setMessages(trimmed);
    setIsTyping(true);
    // History = turns before the user message being re-asked.
    const history = getConversationHistory(
      trimmed.filter((m) => m.id !== lastUser.id)
    );
    await processMessage(lastUser.content, history, true);
  };

  const clearChat = () => {
    setMessages([]);
    setLatestMessageId(null);
    localStorage.removeItem(STORAGE_KEY);
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
        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/playground">
              <FlaskConical className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Playground</span>
            </Link>
          </Button>
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
        </div>
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
                onRegenerate={
                  msg.role === "assistant" &&
                  idx === messages.length - 1 &&
                  !isTyping &&
                  !isStreaming
                    ? handleRegenerate
                    : undefined
                }
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background px-4 py-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isTyping || isStreaming}
          onStop={handleStop}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
