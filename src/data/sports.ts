// src/data/sports.ts
// Sports data feed and Hype Score engine.
// Falls back to mock data when no SPORTS_API_KEY is set.

export interface MatchResult {
  date:        string;
  homeTeam:    string;
  awayTeam:    string;
  homeScore:   number;
  awayScore:   number;
  competition: string;
  status:      "finished" | "live" | "upcoming";
}

export interface TeamNews {
  headline:  string;
  sentiment: "positive" | "negative" | "neutral";
  source:    string;
  date:      string;
}

export interface HypeScore {
  score:      number;           // 0–100
  label:      "cold" | "warming" | "hot" | "hype";
  signal:     "buy" | "hold" | "sell" | "watch";
  factors:    string[];
  confidence: "low" | "medium" | "high";
}

export function calculateHypeScore(results: MatchResult[], news: TeamNews[]): HypeScore {
  let score = 50;
  const factors: string[] = [];

  let pts = 0;
  for (const m of results.slice(0, 5)) {
    if (m.homeScore > m.awayScore) pts += 6;
    else if (m.homeScore === m.awayScore) pts += 2;
    else pts -= 4;
  }
  pts = Math.max(-30, Math.min(30, pts));
  score += pts;
  factors.push(pts > 15 ? "Strong recent form" : pts > 0 ? "Mixed recent form" : "Poor recent form");

  const pos  = news.filter((n) => n.sentiment === "positive").length;
  const neg  = news.filter((n) => n.sentiment === "negative").length;
  const sent = Math.max(-20, Math.min(20, (pos - neg) * 5));
  score      += sent;
  if (sent > 5)  factors.push(`Positive news momentum (${pos} stories)`);
  if (sent < -5) factors.push(`Negative press (${neg} stories)`);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const label:  HypeScore["label"]  = score >= 75 ? "hype" : score >= 55 ? "hot" : score >= 40 ? "warming" : "cold";
  const signal: HypeScore["signal"] = score >= 55 ? "buy"  : score >= 40 ? "hold" : "sell";
  const confidence: HypeScore["confidence"] = results.length >= 4 ? "high" : results.length >= 2 ? "medium" : "low";

  return { score, label, signal, factors, confidence };
}

export class SportsDataClient {
  private apiKey: string | undefined;
  constructor(apiKey?: string) { this.apiKey = apiKey ?? process.env.SPORTS_API_KEY; }

  async getRecentResults(clubName: string): Promise<MatchResult[]> {
    if (!this.apiKey) return this.mockResults(clubName);
    try {
      const res  = await fetch(`https://v3.football.api-sports.io/fixtures?team=${encodeURIComponent(clubName)}&last=5`, { headers: { "x-apisports-key": this.apiKey } });
      const raw  = await res.json() as { response: unknown[] };
      return (raw.response as Record<string, unknown>[]).map((f) => {
        const fix    = f.fixture   as Record<string, unknown>;
        const teams  = f.teams     as Record<string, Record<string, string>>;
        const goals  = f.goals     as Record<string, number | null>;
        const league = f.league    as Record<string, string>;
        const status = fix.status  as Record<string, string>;
        return { date: fix.date as string, homeTeam: teams.home.name, awayTeam: teams.away.name, homeScore: goals.home ?? 0, awayScore: goals.away ?? 0, competition: league.name, status: status.short === "FT" ? "finished" : "upcoming" };
      });
    } catch { return this.mockResults(clubName); }
  }

  async getTeamNews(clubName: string): Promise<TeamNews[]> { return this.mockNews(clubName); }

  async getFullContext(clubName: string) {
    const [results, news] = await Promise.all([this.getRecentResults(clubName), this.getTeamNews(clubName)]);
    return { club: clubName, results, news, hypeScore: calculateHypeScore(results, news) };
  }

  private mockResults(club: string): MatchResult[] {
    return [
      { date: "2026-04-20", homeTeam: club,       awayTeam: "Rival FC",      homeScore: 3, awayScore: 1, competition: "League", status: "finished" },
      { date: "2026-04-13", homeTeam: "Away Side", awayTeam: club,            homeScore: 0, awayScore: 2, competition: "League", status: "finished" },
      { date: "2026-04-06", homeTeam: club,        awayTeam: "Cup Opponent",  homeScore: 1, awayScore: 1, competition: "Cup",    status: "finished" },
      { date: "2026-03-30", homeTeam: "Third FC",  awayTeam: club,            homeScore: 1, awayScore: 3, competition: "League", status: "finished" },
    ];
  }

  private mockNews(club: string): TeamNews[] {
    return [
      { headline: `${club} striker returns from injury ahead of key match`,    sentiment: "positive", source: "Mock Sports", date: "2026-04-23" },
      { headline: `${club} extends contract with star midfielder until 2029`,  sentiment: "positive", source: "Mock Sports", date: "2026-04-22" },
      { headline: `Record ticket demand for ${club}'s upcoming fixture`,       sentiment: "positive", source: "Mock Sports", date: "2026-04-21" },
    ];
  }
}
