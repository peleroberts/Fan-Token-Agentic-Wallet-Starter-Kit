// src/index.ts — Interactive REPL. Run: npm run dev
import "dotenv/config";
import * as readline from "readline";
import { createAdapterFromEnv } from "./llm-adapters/index.js";
import { createWalletFromEnv }  from "./wallet/client.js";
import { createPolicyFromEnv }  from "./guardrails/policy.js";
import { SportsDataClient }     from "./data/sports.js";
import { ToolExecutor }         from "./mcp-tools/executor.js";
import { runAgent }             from "./agent/loop.js";
import type { LLMMessage }      from "./llm-adapters/types.js";

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   Fan Token Agentic Wallet Starter Kit  v1.0.0          ║");
  console.log("║   Open Source · Chiliz Chain · Any LLM                 ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  let wallet;
  try {
    wallet = createWalletFromEnv();
    console.log(`✓ Wallet   ${wallet.address} (${wallet.network})`);
  } catch (e) {
    console.error(`✗ ${(e as Error).message}\n  Copy .env.example → .env and add your keys.`);
    process.exit(1);
  }

  const llm    = await createAdapterFromEnv();
  const policy = createPolicyFromEnv();
  const sports = new SportsDataClient();
  const exec   = new ToolExecutor(wallet, policy, sports);
  const { dailyCapChz, executionMode } = policy.summary();

  console.log(`✓ LLM      ${llm.name} (${process.env.LLM_MODEL ?? "default model"})`);
  console.log(`✓ Policy   ${dailyCapChz} CHZ daily cap · mode: ${executionMode}`);
  console.log(`✓ Sports   ${process.env.SPORTS_API_KEY ? "live (API-Football)" : "mock data"}`);
  console.log("\nAgent ready.\n");
  console.log("Try: 'Check my portfolio'  ·  'Hype score for FC Barcelona'");
  console.log("     'Pay 5 CHZ for a match stream'  ·  'Should I buy BAR?'");
  console.log("─".repeat(58) + "\n");

  const rl      = readline.createInterface({ input: process.stdin, output: process.stdout });
  const history: LLMMessage[] = [];

  const ask = () => rl.question("You: ", async (input) => {
    const msg = input.trim();
    if (!msg || msg === "quit") { console.log("\nGoodbye.\n"); rl.close(); return; }
    console.log("");
    try {
      const result = await runAgent({ llm, executor: exec, userMessage: msg, history, verbose: process.env.VERBOSE === "true" });
      history.splice(0, history.length, ...result.updatedHistory);
      console.log(`\nAgent: ${result.response}\n[${result.toolCallCount} tool calls · ${result.model}]\n`);
    } catch (e) { console.error("Error:", (e as Error).message); }
    ask();
  });

  ask();
}

main();
