"use client";

import { useState } from "react";
import { Search, ExternalLink, Plus, Check } from "lucide-react";
import { DOMAINS } from "@/lib/utils";

interface SearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
}

const LOCATIONS = ["Israel", "Tel Aviv", "Remote"];

export default function SearchPage() {
  const [keywords, setKeywords] = useState("Additive Manufacturing LPBF Computer Vision Anomaly Detection Inspection");
  const [location, setLocation] = useState("Israel");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location, domains: selectedDomains }),
      });
      const d = await r.json();
      if (d.error) setError(d.error);
      else setResults(d.results || []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(result: SearchResult, idx: number) {
    const key = `${idx}`;
    setSaving((s) => new Set(s).add(key));
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          company: result.company,
          location: result.location,
          url: result.url,
          description: result.description,
          source: result.source,
          domain: selectedDomains[0] || null,
        }),
      });
      const d = await r.json();
      if (!d.error) setSaved((s) => new Set(s).add(key));
    } catch {
      // silent
    } finally {
      setSaving((sv) => { const n = new Set(sv); n.delete(key); return n; });
    }
  }

  function toggleDomain(d: string) {
    setSelectedDomains((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Search Jobs</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Find fresh postings via Tavily web search</p>
      </div>

      {/* Search form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 14 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Keywords</div>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Additive Manufacturing, Computer Vision, ..."
              style={{ width: "100%" }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Location</div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ minWidth: 140 }}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
              <option value="">Any</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="label" style={{ marginBottom: 8 }}>Domain filter</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className="btn btn-sm"
                style={{
                  background: selectedDomains.includes(d) ? "var(--accent-dim)" : "transparent",
                  color: selectedDomains.includes(d) ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${selectedDomains.includes(d) ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading}
        >
          <Search size={14} />
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--red)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="section-title">{results.length} Results</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => {
              const key = `${i}`;
              const isSaved = saved.has(key);
              const isSaving = saving.has(key);
              return (
                <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{r.title}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-faint)" }}>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                      {r.company}{r.location && ` · ${r.location}`}
                      <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{r.source}</span>
                    </div>
                    {r.description && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {r.description}
                      </p>
                    )}
                  </div>
                  <button
                    className={`btn btn-sm ${isSaved ? "btn-ghost" : "btn-primary"}`}
                    onClick={() => !isSaved && handleSave(r, i)}
                    disabled={isSaved || isSaving}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {isSaved ? <><Check size={12} /> Saved</> : isSaving ? "Saving..." : <><Plus size={12} /> Save</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>
          Run a search to find fresh job postings
        </div>
      )}
    </div>
  );
}
