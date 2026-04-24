// examples/multi-club-portfolio/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: Multi-Club Portfolio Manager
// PURPOSE:  The agent scans a portfolio of fan tokens across multiple clubs,
//           ranks them by Hype Score, identifies the best opportunity today,
//           and optionally rebalances by routing through the token with the
//           best current signal.
//
// WHO IT'S FOR: Web3-native developers, SportFi applications, fans who
//               hold tokens across multiple clubs and want a single view.
//
// WHAT THIS DEMONSTRATES:
//   - Multi-token balance reads in parallel
//   - Hype Score comparison across clubs
//   - Agent reasoning about relative value
//   - Payment routing: sell weakest → buy strongest
//
// WHAT TO WIRE UP FOR PRODUCTION:
//   - Integrate DEX router for real swap execution
//   - Add on-chain price feeds for CHZ/token exchange rates
//   - Add portfolio value tracking over time (SQLite / Supabase)
//
// Run: npm run example:portfolio
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { createAdapterFromEnv } from "../../src/llm-adapters/index.js";
import { createWalletFromEnv }  from "../../src/wallet/client.js";
import { createPolicyFromEnv }  from "../../src/guardrails/policy.js";
import { SportsDataClient }     from "../../src/data/sports.js";
import { ToolExecutor }         from "../../src/mcp-tools/executor.js";
import { runAgent }             from "../../src/agent/loop.js";

async function main() {
  console.log("📊  Multi-Club Portfolio Manager — BAR · CITY · PSG\n");

  const llm    = await createAdapterFromEnv();
  const wallet = createWalletFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);

  const result = await runAgent({
    llm,
    executor: exec,
    verbose: true,
    systemPromptAppend: `Portfolio under management: BAR (FC Barcelona), CITY (Manchester City), PSG (Paris Saint-Germain).
Rebalancing strategy: if one token has a significantly higher Hype Score than the others and the spend policy allows, propose a modest swap toward the stronger signal. Maximum rebalance: 15 CHZ per session.`,
    userMessage: `
Run a full multi-club portfolio scan and rebalancing analysis.

Please:
1. Get my full portfolio balances (CHZ + all tokens)
2. Get the Hype Score for FC Barcelona (BAR)
3. Get the Hype Score for Manchester City (CITY)  
4. Get the Hype Score for Paris Saint-Germain (PSG)
5. Check my spend policy
6. Rank the three tokens from strongest to weakest signal
7. Identify if there is a clear rebalancing opportunity
8. If yes and within policy, propose a swap
9. Give me a concise portfolio report with a recommended action

Be specific: show all three scores, the ranking, and your reasoning.
    `.trim(),
  });

  console.log("\n═══════════════════════════════════════\n PORTFOLIO REPORT\n═══════════════════════════════════════");
  console.log(result.response);
  console.log(`\nModel: ${result.model} · Tool calls: ${result.toolCallCount}`);
}

main().catch(console.error);
