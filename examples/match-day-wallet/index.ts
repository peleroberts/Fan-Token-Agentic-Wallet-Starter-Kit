// examples/match-day-wallet/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: Match-Day Wallet
// PURPOSE:  On match day, the agent automatically checks if a ticket or
//           streaming pass is available, evaluates the fan's token balance,
//           and proposes purchasing access — all in one autonomous flow.
//
// WHO IT'S FOR: Developers building fan-facing apps, ticketing integrations,
//               or club-branded wallets.
//
// WHAT TO WIRE UP FOR PRODUCTION:
//   - Replace the ticket/stream address with the actual contract or payment address
//   - Integrate a real ticketing API to check seat availability
//   - Add push notifications for match-day triggers
//
// Run: npm run example:matchday
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { createAdapterFromEnv } from "../../src/llm-adapters/index.js";
import { createWalletFromEnv }  from "../../src/wallet/client.js";
import { createPolicyFromEnv }  from "../../src/guardrails/policy.js";
import { SportsDataClient }     from "../../src/data/sports.js";
import { ToolExecutor }         from "../../src/mcp-tools/executor.js";
import { runAgent }             from "../../src/agent/loop.js";

async function main() {
  console.log("⚽  Match-Day Wallet — FC Barcelona vs Real Madrid\n");

  const llm    = await createAdapterFromEnv();
  const wallet = createWalletFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);

  const result = await runAgent({
    llm,
    executor: exec,
    verbose: true,
    systemPromptAppend: `Today is match day: FC Barcelona vs Real Madrid, kick-off 20:00 CET.
A streaming pass for the match costs 8 CHZ. Ticket address: 0xTICKET_CONTRACT_ADDRESS.
If the fan has enough CHZ and the Hype Score is positive, propose purchasing the streaming pass.`,
    userMessage: `
It's match day! FC Barcelona are playing Real Madrid tonight.

Please:
1. Check my CHZ balance
2. Check my BAR token balance  
3. Get the Hype Score for FC Barcelona
4. Check my spend policy
5. If I have enough CHZ and sentiment is positive, propose buying a streaming pass for tonight's match (8 CHZ)
6. Give me a match-day summary

Be specific with numbers and make a clear recommendation.
    `.trim(),
  });

  console.log("\n═══════════════════════════════════════\n MATCH-DAY REPORT\n═══════════════════════════════════════");
  console.log(result.response);
  console.log(`\nModel: ${result.model} · Tool calls: ${result.toolCallCount}`);
}

main().catch(console.error);
