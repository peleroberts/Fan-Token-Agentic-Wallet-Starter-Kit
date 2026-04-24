// src/mcp-tools/executor.ts
// Executes tool calls from the LLM. All write actions go through GuardrailsPolicy.

import * as readline from "readline";
import type { ChilizWallet }     from "../wallet/client.js";
import type { GuardrailsPolicy } from "../guardrails/policy.js";
import type { SportsDataClient } from "../data/sports.js";
import { FAN_TOKENS }            from "../config/chains.js";
import type { Address }          from "viem";

export class ToolExecutor {
  constructor(
    private wallet:  ChilizWallet,
    private policy:  GuardrailsPolicy,
    private sports:  SportsDataClient,
  ) {}

  async execute(name: string, input: Record<string, unknown>): Promise<string> {
    try {
      switch (name) {
        case "get_wallet_info":      return await this.getWalletInfo();
        case "get_token_balance":    return await this.getTokenBalance(input.symbol as string);
        case "get_all_balances":     return await this.getAllBalances();
        case "get_hype_score":       return await this.getHypeScore(input.club as string, input.token_symbol as string);
        case "get_policy":           return JSON.stringify(this.policy.summary(), null, 2);
        case "propose_payment":      return await this.proposePayment(input);
        case "propose_stream_payment": return await this.proposeStreamPayment(input);
        case "propose_swap":         return await this.proposeSwap(input);
        case "propose_vote":         return await this.proposeVote(input);
        case "propose_claim_reward": return await this.proposeClaimReward(input);
        default: return JSON.stringify({ error: `Unknown tool: ${name}` });
      }
    } catch (e) {
      return JSON.stringify({ error: (e as Error).message });
    }
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  private async getWalletInfo() {
    const chz = await this.wallet.getChzBalance();
    return JSON.stringify({ address: this.wallet.address, chzBalance: chz, network: this.wallet.network });
  }

  private async getTokenBalance(symbol: string) {
    const token = FAN_TOKENS[symbol?.toUpperCase()];
    if (!token) return JSON.stringify({ error: `Unknown token: ${symbol}` });
    const bal = await this.wallet.getFanTokenBalance(token);
    return JSON.stringify({ symbol, balance: bal.toString(), club: token.club });
  }

  private async getAllBalances() {
    const chz      = await this.wallet.getChzBalance();
    const balances: Record<string, string> = {};
    for (const [sym, token] of Object.entries(FAN_TOKENS)) {
      try { balances[sym] = (await this.wallet.getFanTokenBalance(token)).toString(); }
      catch { balances[sym] = "error"; }
    }
    return JSON.stringify({ chz, fanTokens: balances }, null, 2);
  }

  private async getHypeScore(club: string, symbol: string) {
    const ctx = await this.sports.getFullContext(club);
    return JSON.stringify({ club, symbol, ...ctx.hypeScore, recentResults: ctx.results.slice(0,3), news: ctx.news.slice(0,3).map((n) => ({ headline: n.headline, sentiment: n.sentiment })) }, null, 2);
  }

  // ── Write (all go through guardrails + optional human approval) ───────────

  private async proposePayment(input: Record<string, unknown>) {
    const { to, amount_chz, purpose, reasoning } = input as { to: string; amount_chz: number; purpose: string; reasoning: string };
    const action = { type: "payment" as const, description: `Pay ${amount_chz} CHZ → ${purpose}`, amountChz: amount_chz, reasoning };
    return await this.executeAction(action, async () => {
      const hash = await this.wallet.transferChz(to as Address, amount_chz.toString());
      return { status: "executed", purpose, amountChz: amount_chz, txHash: hash };
    });
  }

  private async proposeStreamPayment(input: Record<string, unknown>) {
    const { to, rate_chz_per_minute, duration_minutes, purpose, reasoning } = input as { to: string; rate_chz_per_minute: number; duration_minutes: number; purpose: string; reasoning: string };
    const total  = rate_chz_per_minute * duration_minutes;
    const action = { type: "stream" as const, description: `Stream ${rate_chz_per_minute} CHZ/min × ${duration_minutes}min = ${total} CHZ → ${purpose}`, amountChz: total, reasoning };
    return await this.executeAction(action, async () => {
      // NOTE: Integrate a streaming payment protocol here (e.g. Superfluid, Sablier, or custom)
      // For now this simulates the stream setup and charges the full amount upfront.
      const hash = await this.wallet.transferChz(to as Address, total.toString());
      return { status: "executed", purpose, ratePerMinute: rate_chz_per_minute, durationMinutes: duration_minutes, totalChz: total, txHash: hash, note: "Simulated stream — integrate streaming protocol for real micropayments" };
    });
  }

  private async proposeSwap(input: Record<string, unknown>) {
    const { action, token_symbol, amount_chz, reasoning } = input as { action: "buy"|"sell"; token_symbol: string; amount_chz: number; reasoning: string };
    const proposed = { type: "swap" as const, description: `${action.toUpperCase()} ${token_symbol} — ${amount_chz} CHZ`, amountChz: amount_chz, tokenSymbol: token_symbol, reasoning };
    return await this.executeAction(proposed, async () => {
      // NOTE: Integrate DEX router contract here (Uniswap V2-style on Chiliz Chain)
      const mockHash = `0xSIM_SWAP_${Date.now().toString(16)}`;
      return { status: "executed", action, tokenSymbol: token_symbol, amountChz: amount_chz, txHash: mockHash, note: "Simulated — integrate DEX router for live swaps" };
    });
  }

  private async proposeVote(input: Record<string, unknown>) {
    const { token_symbol, proposal_id, vote, reasoning } = input as { token_symbol: string; proposal_id: string; vote: string; reasoning: string };
    const action = { type: "vote" as const, description: `Vote ${vote.toUpperCase()} on proposal ${proposal_id} (${token_symbol})`, amountChz: 0, reasoning };
    return await this.executeAction(action, async () => {
      // NOTE: Integrate governance contract here
      return { status: "executed", vote, proposalId: proposal_id, tokenSymbol: token_symbol, note: "Simulated — integrate governance contract for live votes" };
    });
  }

  private async proposeClaimReward(input: Record<string, unknown>) {
    const { token_symbol, reward_id, reasoning } = input as { token_symbol: string; reward_id: string; reasoning: string };
    const action = { type: "claim" as const, description: `Claim reward ${reward_id} for ${token_symbol} holders`, amountChz: 0, reasoning };
    return await this.executeAction(action, async () => {
      // NOTE: Integrate rewards/airdrop contract here
      return { status: "executed", rewardId: reward_id, tokenSymbol: token_symbol, note: "Simulated — integrate rewards contract for live claims" };
    });
  }

  // ── Guardrails + human approval ───────────────────────────────────────────

  private async executeAction(action: Parameters<GuardrailsPolicy["evaluate"]>[0], fn: () => Promise<unknown>): Promise<string> {
    const decision = this.policy.evaluate(action);
    if (!decision.allowed) return JSON.stringify({ status: "blocked", reason: decision.reason, action });
    if (decision.requiresApproval) {
      const ok = await this.askHuman(action, decision.reason);
      if (!ok) return JSON.stringify({ status: "rejected_by_user", action });
    }
    const result = await fn();
    this.policy.record(action, (result as any).txHash);
    return JSON.stringify(result, null, 2);
  }

  private async askHuman(action: { description: string; reasoning: string; amountChz?: number }, reason: string): Promise<boolean> {
    console.log("\n" + "═".repeat(58));
    console.log("🔔  APPROVAL REQUIRED");
    console.log("═".repeat(58));
    console.log(`Action:   ${action.description}`);
    console.log(`Cost:     ${action.amountChz ?? 0} CHZ`);
    console.log(`Policy:   ${reason}`);
    console.log(`Reasoning:\n  ${action.reasoning}`);
    console.log("─".repeat(58));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question("Approve? [y/N]: ", (a) => { rl.close(); resolve(a.toLowerCase() === "y"); });
    });
  }
}
