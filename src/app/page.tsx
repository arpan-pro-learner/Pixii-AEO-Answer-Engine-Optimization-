"use client";

import React, { useState } from "react";

// ─── Skeleton Component ────────────────────────────────────────────────────────
const Skeleton = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`skeleton ${className}`} style={style} />
);

// ─── Score Ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "var(--success)" : score >= 40 ? "var(--brand)" : "var(--error)";

  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke="#DDD9D4"
        strokeWidth="8"
      />
      <circle
        cx="50" cy="50" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
};

// ─── Visibility Badge ──────────────────────────────────────────────────────────
const VisibilityBadge = ({ visible }: { visible: boolean }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
    style={{
      background: visible ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
      color: visible ? "var(--success)" : "var(--error)",
      border: `1px solid ${visible ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
    }}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: visible ? "var(--success)" : "var(--error)" }} />
    {visible ? "Visible" : "Not Visible"}
  </span>
);

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => (
  <nav
    style={{
      background: "rgba(238,234,230,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}
  >
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--brand)", letterSpacing: "-0.02em" }}>
            Pixii
          </span>
          <span style={{
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
            background: "var(--brand)", color: "white",
            padding: "2px 6px", borderRadius: "4px",
          }}>
            AEO
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>
            Powered by Gemini AI API's
          </span>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 6px var(--success)",
          }} />
        </div>
      </div>
    </div>
  </nav>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const simulateLoading = async () => {
    const statuses = [
      "Initializing Intelligence Suite...",
      "Consulting Gemma 4 (General Buyer)...",
      "Querying Llama 3.2 (Health Specialist)...",
      "Analyzing with Qwen 3.5 (Price Strategy)...",
      "Calculating AEO Resonance Score...",
      "Generating Strategy Roadmap..."
    ];
    
    for (let i = 0; i < statuses.length; i++) {
      if (!isLoading) break;
      setLoadingStatus(statuses[i]);
      await new Promise(r => setTimeout(r, 1200));
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setLoadingStatus("Connecting to AI API'S...");

    const statusPromise = simulateLoading();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, url }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Intelligence generation failed. Please try again.");
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "var(--background)" }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="grid-bg"
          style={{ padding: "80px 24px 60px", textAlign: "center", position: "relative" }}
        >
          {/* Section label */}
          <div style={{ marginBottom: "20px" }}>
            <span className="pixii-tag">AEO Intelligence Suite</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.07,
            color: "var(--foreground)",
            marginBottom: "20px",
          }}>
            AI Visibility,{" "}
            <span style={{ color: "var(--brand)" }}>Decoded.</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: "1.1rem",
            color: "var(--foreground-muted)",
            maxWidth: "560px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}>
            Simulate agent personas to uncover how AI models perceive your product — and what it takes to rank.
          </p>

          {/* ── Input Console ──────────────────────────────────────────────── */}
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div
              className="pixii-card"
              style={{ padding: "24px", textAlign: "left" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Query */}
                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "0.7rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--foreground-muted)",
                  }}>
                    Search Query *
                  </label>
                  <input
                    id="query-input"
                    type="text"
                    className="pixii-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Best protein powder for athletes"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "0.95rem" }}
                  />
                </div>
                {/* URL */}
                <div>
                  <label style={{
                    display: "block", marginBottom: "6px",
                    fontSize: "0.7rem", fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--foreground-muted)",
                  }}>
                    Product URL
                    <span style={{ fontWeight: 400, textTransform: "none", marginLeft: "4px", fontSize: "0.65rem" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    id="url-input"
                    type="text"
                    className="pixii-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="amazon.com/dp/..."
                    style={{ width: "100%", padding: "10px 14px", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              {/* Button */}
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="btn-brand"
                style={{
                  width: "100%", padding: "14px 24px",
                  fontSize: "1rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(201, 74, 37, 0.2)",
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                    {loadingStatus || "Processing Intelligence..."}
                  </>
                ) : (
                  <>
                    Analyze Visibility
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: "12px", padding: "12px 16px",
                  background: "rgba(220,38,38,0.07)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: "10px", color: "var(--error)",
                  fontSize: "0.85rem", textAlign: "left",
                }}>
                  <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    Intelligence Suite Error
                  </div>
                  {error.includes("quota") || error.includes("exceeded") || error.includes("offline")
                    ? "Your Gemini Free Tier API limit is currently busy. Please wait 60 seconds and try again (Google allows 15 requests per minute)."
                    : error}
                </div>
              )}
            </div>

            <p style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--foreground-light)" }}>
              Free to use. Powered by Gemini API's.
            </p>
          </div>
        </section>

        {/* ── Loading State ─────────────────────────────────────────────────── */}
        {isLoading && (
          <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="pixii-card" style={{ padding: "28px" }}>
                  <Skeleton className="w-24 h-3 mb-4" style={{ width: "96px", height: "12px", marginBottom: "16px" }} />
                  <Skeleton style={{ width: "60%", height: "20px", marginBottom: "12px" }} />
                  <Skeleton style={{ width: "100%", height: "14px", marginBottom: "8px" }} />
                  <Skeleton style={{ width: "80%", height: "14px" }} />
                </div>
              ))}
            </div>
            <div className="pixii-card" style={{ padding: "28px" }}>
              <Skeleton style={{ width: "180px", height: "16px", marginBottom: "20px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} style={{ height: "48px" }} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {results && (
          <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 100px" }}>

            {/* ── Top Row: Score + Visibility Report ── */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", marginBottom: "20px" }}>

              {/* Score Card */}
              <div
                className="pixii-card animate-fade-in-up"
                style={{
                  padding: "36px 24px",
                  textAlign: "center",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "12px",
                }}
              >
                <span className="section-label">AEO Resonance</span>
                <div style={{ position: "relative", width: "100px", height: "100px" }}>
                  <ScoreRing score={results.insights.visibilityScore} />
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column",
                  }}>
                    <span style={{
                      fontSize: "1.75rem", fontWeight: 900,
                      color: "var(--foreground)", lineHeight: 1,
                    }}>
                      {results.insights.visibilityScore}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "var(--foreground-muted)", fontWeight: 600 }}>/100</span>
                  </div>
                </div>
                <VisibilityBadge visible={results.insights.isVisible} />
                <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", lineHeight: 1.5 }}>
                  {results.insights.isVisible
                    ? `Resonating with ${results.insights.competitorOverlap} target personas`
                    : "Below the AI visibility threshold"}
                </p>
              </div>

              {/* Recommendations Panel */}
              <div
                className="pixii-card animate-fade-in-up delay-100"
                style={{ padding: "32px" }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <span className="section-label">Strategic Recommendations</span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "4px", letterSpacing: "-0.02em" }}>
                    What to improve
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {results.insights.recommendations.map((rec: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", gap: "10px", alignItems: "flex-start",
                        padding: "14px 16px",
                        background: "var(--background)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{
                        flexShrink: 0, width: "20px", height: "20px",
                        background: "var(--brand-light)", color: "var(--brand)",
                        borderRadius: "50%", fontSize: "0.7rem", fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", lineHeight: 1.5 }}>
                        {rec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Agent Cards ── */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <span className="section-label">Agent Perspectives</span>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "4px", letterSpacing: "-0.02em" }}>
                  How 3 AI personas see your category
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {Object.entries(results.agents).map(([key, agent]: [string, any], idx) => {
                  const accentColors = ["#C94A25", "#7C3AED", "#0369A1"];
                  const accent = accentColors[idx % accentColors.length];
                  return (
                    <div
                      key={key}
                      className="pixii-card animate-fade-in-up"
                      style={{
                        padding: "24px",
                        animationDelay: `${(idx + 2) * 0.1}s`,
                        borderTop: `3px solid ${accent}`,
                      }}
                    >
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "16px", color: "var(--foreground)" }}>
                        {agent.name}
                      </h3>

                      {/* Recs */}
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--foreground-light)", marginBottom: "8px" }}>
                          Top Picks
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {agent.content?.recommendations?.map((prod: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: "4px 10px",
                                background: "var(--background)",
                                border: "1px solid var(--border)",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                color: "var(--foreground-muted)",
                              }}
                            >
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Hooks */}
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--foreground-light)", marginBottom: "8px" }}>
                          Psychology Hooks
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {agent.content?.hooks?.map((hook: string, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: "3px 9px",
                                background: `${accent}14`,
                                border: `1px solid ${accent}30`,
                                borderRadius: "999px",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: accent,
                              }}
                            >
                              {hook}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div>
                        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--foreground-light)", marginBottom: "8px" }}>
                          Reasoning
                        </p>
                        <p style={{
                          fontSize: "0.8rem", color: "var(--foreground-muted)",
                          lineHeight: 1.6, fontStyle: "italic",
                          padding: "10px 12px",
                          background: "var(--background)",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                        }}>
                          "{agent.content?.reasoning}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Dark CTA Section + Competitive Map ── */}
            <div
              className="animate-fade-in-up delay-400"
              style={{
                background: "var(--background-dark)",
                borderRadius: "24px",
                padding: "48px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* subtle orange glow */}
              <div style={{
                position: "absolute", top: "-80px", right: "-80px",
                width: "300px", height: "300px",
                background: "rgba(201, 74, 37, 0.15)",
                borderRadius: "50%",
                filter: "blur(80px)",
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
                  <div style={{ width: "40px", height: "3px", background: "var(--brand)", borderRadius: "2px" }} />
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                    Competitive Resonance Map
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
                  {/* Competitors */}
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                      Market Dominators
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {results.aeoData.topCompetitors.map((comp: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                            {comp.name}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", fontWeight: 600 }}>
                              Consensus
                            </span>
                            <span style={{
                              padding: "3px 10px",
                              background: "var(--brand)",
                              color: "white",
                              borderRadius: "6px",
                              fontSize: "0.7rem", fontWeight: 800,
                            }}>
                              {comp.count} agents
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hooks */}
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                      High-Resonance Patterns
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {results.aeoData.commonHooks.map((h: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 16px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            display: "flex", alignItems: "center", gap: "10px",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                            "{h.hook}"
                          </span>
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 800,
                            color: "var(--brand)",
                            background: "rgba(201,74,37,0.15)",
                            padding: "1px 6px", borderRadius: "4px",
                          }}>
                            {h.count}×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !results && (
          <section style={{ textAlign: "center", padding: "60px 24px 100px" }}>
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px",
              padding: "40px 48px",
              background: "var(--background-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "var(--brand-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)" }}>
                Ready to scan
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", maxWidth: "260px", lineHeight: 1.5 }}>
                Enter a product search query above to generate your AEO intelligence report.
              </p>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "0.8rem", color: "var(--foreground-light)" }}>
            © 2026 Pixii AEO Scanner — Built for Amazon Sellers
          </p>
        </footer>
      </main>
    </>
  );
}
