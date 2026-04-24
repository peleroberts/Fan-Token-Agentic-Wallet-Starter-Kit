// examples/governance-agent/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: Governance Agent
// PURPOSE:  The agent reads active governance proposals, reasons about each
//           one based on the fan's stated preferences, and autonomously
//           casts votes — with human approval before any submission.
//
// WHO IT'S FOR: Club tech teams, DAO tooling developers, fans who want
//               their voice counted without manually reviewing every proposal.
//
// HOW IT WORKS:
//   Fan sets preferences → Agent reads proposals → Reasons about each →
//   Proposes votes aligned with preferences → Fan approves → Votes cast
//
// WHAT TO WIRE UP FOR PRODUCTION:
//   - Connect to the fan token governance contract to read live proposals
//   - Implement the vote submission contract call in executor.ts
//   - Add proposal deadline monitoring and reminder notifications
//
// Run: npm run example:governance
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { createAdapterFromEnv } from "../../src/llm-adapters/index.js";
import { createWalletFromEnv }  from "../../src/wallet/client.js";
import { createPolicyFromEnv }  from "../../src/guardrails/policy.js";
import { SportsDataClient }     from "../../src/data/sports.js";
import { ToolExecutor }         from "../../src/mcp-tools/executor.js";
import { runAgent }             from "../../src/agent/loop.js";

// Mock active proposals — replace with live contract reads in production
const ACTIVE_PROPOSALS = [
  { id: "PROP-2026-041", title: "New third kit design: retro gold colourway", description: "Vote on approving the retro gold colourway for the 2026/27 third kit." },
  { id: "PROP-2026-042", title: "Fan zone expansion at Camp Nou", description: "Allocate 500,000 CHZ from the fan fund to expand the pre-match fan zone." },
  { id: "PROP-2026-043", title: "Charity partnership: UNICEF donation match", description: "Club to match all fan donations to UNICEF during April up to 1M CHZ." },
];

async function main() {
  console.log("🗳️  Governance Agent — FC Barcelona Active Proposals\n");

  const llm    = await createAdapterFromEnv();
  const wallet = createWalletFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);

  const proposalsText = ACTIVE_PROPOSALS.map((p) => `• [${p.id}] ${p.title}\n  ${p.description}`).join("\n\n");

  const result = await runAgent({
    llm,
    executor: exec,
    verbose: true,
    systemPromptAppend: `
Fan preferences on file:
- Supports sustainability and charity initiatives (vote YES)
- Prefers classic kit aesthetics (vote YES on retro designs)
- Cautious about large fund expenditures without clear ROI (vote NO or ABSTAIN)

Active proposals:
${proposalsText}
    `.trim(),
    userMessage: `
Review all active BAR governance proposals and vote on my behalf based on my preferences.

For each proposal:
1. Check my BAR token balance (needed for voting weight)
2. Reason about how it aligns with my preferences
3. State your recommended vote with clear reasoning
4. Propose casting the vote

After all proposals, give a brief summary of the votes you're recommending.
    `.trim(),
  });

  console.log("\n═══════════════════════════════════════\n GOVERNANCE SUMMARY\n═══════════════════════════════════════");
  console.log(result.response);
  console.log(`\nModel: ${result.model} · Tool calls: ${result.toolCallCount}`);
}

main().catch(console.error);
