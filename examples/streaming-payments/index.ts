// examples/streaming-payments/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: Streaming Micropayments
// PURPOSE:  The agent manages a pay-per-minute stream of CHZ to a content
//           provider — allowing fans to pay only for what they watch.
//           Perfect for post-match analysis, training ground content,
//           or exclusive press conference access.
//
// WHO IT'S FOR: Content platforms, media companies, streaming services
//               looking to accept Fan Token micropayments.
//
// PAYMENT MODEL:
//   Fan holds CHZ → Agent streams X CHZ/minute to content provider
//   → Access unlocked for duration → Stream stops when balance runs low
//
// WHAT TO WIRE UP FOR PRODUCTION:
//   - Integrate Superfluid or Sablier for real on-chain streaming
//   - Add a balance monitor to pause/resume the stream automatically
//   - Connect to a content DRM API to gate access based on stream status
//
// Run: npm run example:streaming
// ─────────────────────────────────────────────────────────────────────────────

import "dotenv/config";
import { createAdapterFromEnv } from "../../src/llm-adapters/index.js";
import { createWalletFromEnv }  from "../../src/wallet/client.js";
import { createPolicyFromEnv }  from "../../src/guardrails/policy.js";
import { SportsDataClient }     from "../../src/data/sports.js";
import { ToolExecutor }         from "../../src/mcp-tools/executor.js";
import { runAgent }             from "../../src/agent/loop.js";

async function main() {
  console.log("📺  Streaming Payments — Exclusive Post-Match Content\n");

  const llm    = await createAdapterFromEnv();
  const wallet = createWalletFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);

  const result = await runAgent({
    llm,
    executor: exec,
    verbose: true,
    systemPromptAppend: `
Content provider: 0xCONTENT_PROVIDER_ADDRESS
Available content: "PSG Post-Match Analysis with Nasser Al-Khelaïfi" — 45 minutes
Stream rate: 0.1 CHZ per minute
Total cost: 4.5 CHZ for full content
The fan can also choose a shorter session (e.g. 15 minutes = 1.5 CHZ).
    `.trim(),
    userMessage: `
I want to watch the exclusive PSG post-match analysis.

Please:
1. Check my CHZ balance
2. Check my PSG token holdings
3. Check my spend policy
4. Calculate if I can afford 45 minutes (0.1 CHZ/min = 4.5 CHZ total)
5. If affordable, propose setting up the streaming payment
6. If my balance is tight, suggest a shorter duration I can afford

Show me the cost breakdown clearly.
    `.trim(),
  });

  console.log("\n═══════════════════════════════════════\n STREAMING PAYMENT SUMMARY\n═══════════════════════════════════════");
  console.log(result.response);
  console.log(`\nModel: ${result.model} · Tool calls: ${result.toolCallCount}`);
}

main().catch(console.error);
