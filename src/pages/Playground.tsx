import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronDown,
  Database,
  FlaskConical,
  Layers,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DevconLogo from "@/components/DevconLogo";
import { getIndexStats, retrieveDebug } from "@/services/chatService";
import type { IndexStats, RetrieveResponse } from "@/types/chat";

const EXAMPLE_QUERIES = [
  "How do I apply for the DEVCON internship?",
  "What happens at the leaders oath taking?",
  "What is the strategy canvas for Bohol?",
  "What is the weather in Manila today?",
];

const TIER_STYLES: Record<string, string> = {
  strong:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  weak: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  none: "border-border bg-secondary text-muted-foreground",
};

const TIER_LABELS: Record<string, string> = {
  strong: "STRONG — answer is grounded in the docs",
  weak: "WEAK — loosely covered; answer will hedge",
  none: "NONE — docs don't cover this; honest refusal",
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-lg font-semibold leading-tight text-foreground">{value}</div>
      <div className="truncate text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);

const Playground: React.FC = () => {
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RetrieveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [corpusOpen, setCorpusOpen] = useState(false);

  useEffect(() => {
    getIndexStats().then(setStats).catch(() => {});
  }, []);

  const run = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setExpanded(new Set());
    try {
      setResult(await retrieveDebug(q.trim()));
    } catch (e) {
      setError("Retrieval failed — the backend may be waking up (scale-to-zero). Try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/chat">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <DevconLogo />
          <span className="ml-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FlaskConical className="h-4 w-4 text-primary" /> RAG Playground
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            See how DEBBIE retrieves
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Type a question to inspect the hybrid retrieval pipeline: semantic
            similarity (cosine), keyword rank (BM25), reciprocal-rank fusion, and
            the confidence gate that decides whether an answer is grounded,
            hedged, or honestly refused.
          </p>
        </section>

        {stats && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Layers className="h-4 w-4" />}
              label="indexed chunks"
              value={stats.document_count}
            />
            <StatCard
              icon={<Database className="h-4 w-4" />}
              label={`source documents (KB ${stats.kb_version ?? "?"})`}
              value={stats.documents?.length ?? "—"}
            />
            <StatCard
              icon={<Search className="h-4 w-4" />}
              label="retrieval"
              value={stats.hybrid_search ? "hybrid" : "vector"}
            />
            <StatCard
              icon={<SlidersHorizontal className="h-4 w-4" />}
              label={`embeddings · ${stats.embedding_model ?? ""}`}
              value={`top-${stats.top_k_retrieval ?? 5}`}
            />
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/30">
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <input
              className="h-9 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="Try a query against the index…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(query)}
            />
            <Button size="sm" onClick={() => run(query)} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retrieve"}
            </Button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  run(q);
                }}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  TIER_STYLES[result.tier]
                )}
              >
                {TIER_LABELS[result.tier] ?? result.tier}
              </span>
              <span className="text-xs text-muted-foreground">
                gate: strong ≥ {result.thresholds.strong} · weak ≥ {result.thresholds.weak} (top cosine)
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-[2rem_1fr_5rem_4rem_5rem] items-center gap-2 border-b border-border bg-secondary/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>#</span>
                <span>Chunk</span>
                <span className="text-right">Cosine</span>
                <span className="text-right">BM25</span>
                <span className="text-right">RRF</span>
              </div>
              {result.candidates.map((c) => {
                const isOpen = expanded.has(c.chunk_id);
                return (
                  <div key={c.chunk_id} className="border-b border-border last:border-b-0">
                    <button
                      onClick={() => toggle(c.chunk_id)}
                      className="grid w-full grid-cols-[2rem_1fr_5rem_4rem_5rem] items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className="text-sm font-semibold text-muted-foreground">
                        {c.final_rank}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-foreground">
                          {c.title}
                        </span>
                        {c.section && (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            § {c.section}
                          </span>
                        )}
                      </span>
                      <span className="text-right text-[13px] tabular-nums text-foreground/80">
                        {c.cosine !== null ? c.cosine.toFixed(3) : "—"}
                      </span>
                      <span className="text-right text-[13px] tabular-nums text-foreground/80">
                        {c.bm25_rank !== null ? `#${c.bm25_rank}` : "—"}
                      </span>
                      <span className="flex items-center justify-end gap-1 text-right text-[13px] tabular-nums text-foreground/80">
                        {c.rrf.toFixed(4)}
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 text-muted-foreground transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-dashed border-border bg-secondary/20 px-4 py-3">
                        <p className="whitespace-pre-wrap text-[13px] leading-6 text-foreground/80">
                          {c.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {stats?.documents && (
          <section>
            <button
              onClick={() => setCorpusOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  corpusOpen && "rotate-180"
                )}
              />
              Knowledge base ({stats.documents.length} documents,{" "}
              {stats.document_count} chunks)
            </button>
            {corpusOpen && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[1fr_5rem_5rem] gap-2 border-b border-border bg-secondary/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Document</span>
                  <span className="text-right">Chunks</span>
                  <span className="text-right">Sections</span>
                </div>
                {stats.documents.map((d) => (
                  <div
                    key={d.title}
                    className="grid grid-cols-[1fr_5rem_5rem] gap-2 border-b border-border px-3 py-2 text-[13px] last:border-b-0"
                  >
                    <span className="truncate text-foreground/90">{d.title}</span>
                    <span className="text-right tabular-nums text-muted-foreground">
                      {d.chunk_count}
                    </span>
                    <span className="text-right tabular-nums text-muted-foreground">
                      {d.sections}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Playground;
