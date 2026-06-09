export interface SearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  postedAt: string | null;
  source: string;
}

export async function searchJobs(
  keywords: string,
  location: string = "Israel",
  domains: string[] = []
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not configured");

  const domainFilter = domains.length > 0 ? ` (${domains.join(" OR ")})` : "";
  const query = `"Product Manager" OR "Product Lead" OR "Senior Product Manager" ${keywords}${domainFilter} ${location} job 2025 2026`;

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 10,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.results || [])
    .filter((r: { url: string; title: string; content: string }) => {
      const url = r.url.toLowerCase();
      const title = r.title.toLowerCase();
      // Filter out non-job results
      return (
        url.includes("job") ||
        url.includes("career") ||
        url.includes("linkedin.com/jobs") ||
        url.includes("drushim") ||
        url.includes("alljobs") ||
        url.includes("glassdoor") ||
        url.includes("indeed") ||
        title.includes("job") ||
        title.includes("hiring") ||
        title.includes("vacancy")
      );
    })
    .map((r: { title: string; url: string; content: string }) => {
      // Extract company from title (heuristic)
      const titleParts = r.title.split(" at ").concat(r.title.split(" - ")).concat(r.title.split(" | "));
      const company = titleParts.length > 1 ? titleParts[titleParts.length - 1].trim() : "Unknown";

      return {
        title: r.title,
        company,
        location,
        url: r.url,
        description: r.content?.slice(0, 2000) || "",
        postedAt: null,
        source: "tavily",
      } as SearchResult;
    });
}
