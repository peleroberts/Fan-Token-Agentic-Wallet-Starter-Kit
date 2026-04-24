// src/mcp-tools/definitions.ts
// Tool definitions passed to the LLM. These define what the agent can do.
// Add new tools here and implement them in executor.ts.

export const WALLET_TOOLS = [
  // ── Read tools ─────────────────────────────────────────────────────────────
  {
    name: "get_wallet_info",
    description: "Returns wallet address, CHZ balance, and current network. Call this first.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_token_balance",
    description: "Returns the wallet balance of a specific fan token (BAR, CITY, PSG, JUV, ACM).",
    input_schema: {
      type: "object" as const,
      properties: { symbol: { type: "string", description: "Token symbol e.g. BAR", enum: ["BAR","CITY","PSG","JUV","ACM"] } },
      required: ["symbol"],
    },
  },
  {
    name: "get_all_balances",
    description: "Returns CHZ balance and all fan token balances. Use for portfolio overview.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_hype_score",
    description: "Gets match results and news for a club. Returns a Hype Score (0–100) with a buy/hold/sell signal.",
    input_schema: {
      type: "object" as const,
      properties: {
        club:         { type: "string", description: "Full club name e.g. FC Barcelona" },
        token_symbol: { type: "string", description: "Fan token symbol e.g. BAR" },
      },
      required: ["club","token_symbol"],
    },
  },
  {
    name: "get_policy",
    description: "Returns current guardrail policy: daily cap, approval threshold, spend today, remaining budget.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },

  // ── Payment tools ──────────────────────────────────────────────────────────
  {
    name: "propose_payment",
    description: "Proposes a CHZ or fan token payment to an address. Use for ticket purchases, merchandise, content access, or any direct payment. Goes through guardrails before execution.",
    input_schema: {
      type: "object" as const,
      properties: {
        to:           { type: "string", description: "Recipient wallet address" },
        amount_chz:   { type: "number", description: "Amount in CHZ to send" },
        purpose:      { type: "string", description: "What this payment is for e.g. 'Match ticket - Seat 14B'" },
        reasoning:    { type: "string", description: "Why the agent is making this payment" },
      },
      required: ["to","amount_chz","purpose","reasoning"],
    },
  },
  {
    name: "propose_stream_payment",
    description: "Proposes initiating a streaming micropayment — a recurring small payment per time unit. Used for pay-per-view, content subscriptions, or per-minute access.",
    input_schema: {
      type: "object" as const,
      properties: {
        to:                    { type: "string", description: "Recipient address" },
        rate_chz_per_minute:   { type: "number", description: "CHZ to stream per minute" },
        duration_minutes:      { type: "number", description: "How many minutes to stream for" },
        purpose:               { type: "string", description: "What access this payment unlocks" },
        reasoning:             { type: "string" },
      },
      required: ["to","rate_chz_per_minute","duration_minutes","purpose","reasoning"],
    },
  },

  // ── Trading tools ──────────────────────────────────────────────────────────
  {
    name: "propose_swap",
    description: "Proposes a token swap on a Chiliz Chain DEX. Buy = CHZ → fan token. Sell = fan token → CHZ. Always check get_hype_score and get_policy first.",
    input_schema: {
      type: "object" as const,
      properties: {
        action:       { type: "string", enum: ["buy","sell"] },
        token_symbol: { type: "string", enum: ["BAR","CITY","PSG","JUV","ACM"] },
        amount_chz:   { type: "number", description: "CHZ amount to spend (buy) or equivalent (sell)" },
        reasoning:    { type: "string", description: "Data-driven reasoning for this trade" },
      },
      required: ["action","token_symbol","amount_chz","reasoning"],
    },
  },

  // ── Governance & rewards tools ─────────────────────────────────────────────
  {
    name: "propose_vote",
    description: "Proposes casting a governance vote using fan token holdings. Votes are gasless.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_symbol: { type: "string", enum: ["BAR","CITY","PSG","JUV","ACM"] },
        proposal_id:  { type: "string", description: "On-chain proposal ID" },
        vote:         { type: "string", enum: ["yes","no","abstain"] },
        reasoning:    { type: "string" },
      },
      required: ["token_symbol","proposal_id","vote","reasoning"],
    },
  },
  {
    name: "propose_claim_reward",
    description: "Proposes claiming an available loyalty reward or airdrop for a fan token holding.",
    input_schema: {
      type: "object" as const,
      properties: {
        token_symbol: { type: "string", enum: ["BAR","CITY","PSG","JUV","ACM"] },
        reward_id:    { type: "string", description: "Reward or airdrop ID to claim" },
        reasoning:    { type: "string" },
      },
      required: ["token_symbol","reward_id","reasoning"],
    },
  },
] as const;

export type ToolName = typeof WALLET_TOOLS[number]["name"];
