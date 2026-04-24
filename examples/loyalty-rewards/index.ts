// examples/loyalty-rewards/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: Loyalty Rewards Agent
// PURPOSE:  The agent monitors available loyalty rewards and airdrops for
//           the fan's token holdings, evaluates which are worth claiming,
//           and proposes claiming them automatically.
//
// WHO IT'S FOR: Fan loyalty platforms, club reward programs, developers
//               building fan engagement tools.
//
// REWARD TYPES DEMONSTRATED:
//   - Match attendance bonus (hold tokens on match day = earn CHZ back)
//   - Streak reward (hold for 30+ days = multiplier bonus)
//   - Airdrop claim (new season merchandise discount voucher)
//   - Governance participation reward (voted in last 3 proposals)
//
// WHAT TO WIRE UP FOR PRODUCTION:
//   - Connect to the club's reward contract to read live available claims
//   - Add a scheduler to check for new rewards daily
//   - Integrate voucher/NFT delivery after successful claim
//
// Run: npm run example:loyalty
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { createAdapterFromEnv } from "../../src/llm-adapters/index.js";
import { createWalletFromEnv }  from "../../src/wallet/client.js";
import { createPolicyFromEnv }  from "../../src/guardrails/policy.js";
import { SportsDataClient }     from "../../src/data/sports.js";
import { ToolExecutor }         from "../../src/mcp-tools/executor.js";
import { runAgent }             from "../../src/agent/loop.js";

// Mock available rewards — replace with live contract reads in production
const AVAILABLE_REWARDS = [
  { id: "RWD-MATCHDAY-0420", description: "Match attendance bonus — held BAR on 20 Apr match day", valueChz: 2.5, expires: "2026-04-30" },
  { id: "RWD-STREAK-30D",    description: "30-day hold streak reward — BAR tokens held continuously", valueChz: 5.0, expires: "2026-05-15" },
  { id: "RWD-AIRDROP-KIT26", description: "2026/27 kit season airdrop — 20% merchandise discount voucher", valueChz: 0, expires: "2026-06-01", type: "voucher" },
];

async function main() {
  console.log("🎁  Loyalty Rewards Agent — FC Barcelona\n");

  const llm    = await createAdapterFromEnv();
  const wallet = createWalletFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);

  const rewardsText = AVAILABLE_REWARDS.map((r) =>
    `• [${r.id}] ${r.description}\n  Value: ${r.valueChz > 0 ? r.valueChz + " CHZ" : r.type ?? "voucher"} · Expires: ${r.expires}`
  ).join("\n\n");

  const result = await runAgent({
    llm,
    executor: exec,
    verbose: true,
    systemPromptAppend: `Available loyalty rewards for this wallet:\n\n${rewardsText}\n\nClaim rewards in order of expiry (soonest first). All rewards are free to claim (no CHZ cost).`,
    userMessage: `
Check and claim all available loyalty rewards for my BAR token holdings.

Please:
1. Check my BAR token balance to confirm eligibility
2. Review each available reward
3. Prioritise by expiry date (claim soonest-expiring first)
4. Propose claiming each reward with a brief explanation of what it is
5. Give me a total summary of what I'm claiming and its value

Note any rewards that are about to expire urgently.
    `.trim(),
  });

  console.log("\n═══════════════════════════════════════\n REWARDS SUMMARY\n═══════════════════════════════════════");
  console.log(result.response);
  console.log(`\nModel: ${result.model} · Tool calls: ${result.toolCallCount}`);
}

main().catch(console.error);
