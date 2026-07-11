import React, { useState } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  RefreshCw,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { sendFeedback } from "@/services/chatService";
import type { AskMetadata, SourceRef } from "@/types/chat";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  // v2 metadata (assistant messages only)
  sources?: SourceRef[];
  grounded?: boolean;
  confidence?: AskMetadata["confidence"];
  requestId?: string;
  stopped?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  isNewMessage?: boolean;
  onRegenerate?: () => void;
}

/** Turn bare [n] citation markers into cite: links (skipping real md links). */
const linkifyCitations = (content: string, maxN: number): string =>
  content.replace(/\[(\d{1,2})\](?!\()/g, (m, n) =>
    Number(n) >= 1 && Number(n) <= maxN ? `[${n}](cite:${n})` : m
  );

const GroundedBadge: React.FC<{ grounded?: boolean; confidence?: string }> = ({
  grounded,
  confidence,
}) => {
  if (grounded === undefined) return null;
  if (grounded && confidence === "strong")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <BookOpenCheck className="h-3 w-3" /> Grounded in DEVCON docs
      </span>
    );
  if (grounded)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
        <ShieldAlert className="h-3 w-3" /> Partially covered by docs
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Globe className="h-3 w-3" /> General knowledge
    </span>
  );
};

const ScoreBar: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null || score === undefined) return null;
  const pct = Math.round(Math.min(Math.max(score, 0), 1) * 100);
  return (
    <span className="inline-flex items-center gap-1.5" title={`cosine similarity ${score}`}>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
        <span
          className="block h-full rounded-full bg-primary/70"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-[10px] tabular-nums text-muted-foreground">{pct}%</span>
    </span>
  );
};

const SourceCards: React.FC<{ messageId: string; sources: SourceRef[] }> = ({
  messageId,
  sources,
}) => {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (n: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });

  return (
    <div className="mt-3 space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">Sources</div>
      {sources.map((s) => {
        const isOpen = expanded.has(s.n);
        return (
          <div
            key={s.chunk_id}
            id={`src-${messageId}-${s.n}`}
            className={cn(
              "rounded-lg border border-border bg-card/50 transition-colors",
              !s.cited && "opacity-60"
            )}
          >
            <button
              onClick={() => toggle(s.n)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                {s.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">
                  {s.title}
                </span>
                {s.section && (
                  <span className="block truncate text-[11px] text-muted-foreground">
                    § {s.section}
                  </span>
                )}
              </span>
              <ScoreBar score={s.score} />
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-border px-3 py-2">
                <p className="whitespace-pre-wrap text-[13px] leading-6 text-foreground/80">
                  {s.text}
                </p>
                {s.drive_link && (
                  <a
                    href={s.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    View Document
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatest,
  isNewMessage = false,
  onRegenerate,
}) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  const handleVote = (rating: "up" | "down") => {
    if (voted || !message.requestId) return;
    setVoted(rating);
    sendFeedback(message.requestId, rating).catch(() => {});
    toast({ title: "Thanks for the feedback!" });
  };

  const scrollToSource = (n: number) => {
    document
      .getElementById(`src-${message.id}-${n}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const sources = message.sources ?? [];
  const content =
    sources.length > 0
      ? linkifyCitations(message.content, sources.length)
      : message.content;

  const renderContent = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) =>
          url.startsWith("cite:") ? url : defaultUrlTransform(url)
        }
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
          table: ({ children, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th
              className="border border-border bg-secondary/50 px-3 py-1.5 text-left font-semibold"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-1.5" {...props}>
              {children}
            </td>
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
            // Inline citation chip: [n](cite:n)
            if (href?.startsWith("cite:")) {
              const n = Number(href.slice(5));
              return (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSource(n);
                  }}
                  className="mx-0.5 inline-flex h-4 min-w-4 -translate-y-1 items-center justify-center rounded-full bg-primary/15 px-1 align-baseline text-[10px] font-semibold leading-none text-primary transition-colors hover:bg-primary/25"
                  title={`Source ${n}`}
                >
                  {n}
                </button>
              );
            }
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
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">DEBBIE</span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
          <GroundedBadge grounded={message.grounded} confidence={message.confidence} />
          {message.stopped && (
            <span className="text-[11px] italic text-muted-foreground">(stopped)</span>
          )}
        </div>
        <div className="markdown-content text-[15px] text-foreground/90">
          {renderContent(content)}
        </div>

        {sources.length > 0 && (
          <SourceCards messageId={message.id} sources={sources} />
        )}

        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Copy answer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {message.requestId && (
            <>
              <button
                onClick={() => handleVote("up")}
                disabled={!!voted}
                className={cn(
                  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none",
                  voted === "up" && "text-emerald-500"
                )}
                title="Good answer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleVote("down")}
                disabled={!!voted}
                className={cn(
                  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none",
                  voted === "down" && "text-red-500"
                )}
                title="Bad answer"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {isLatest && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Regenerate answer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
