// src/agent/loop.ts
// The agent loop. LLM-agnostic — works with any adapter.
// Sends system prompt + history to the LLM, handles tool use, loops until done.

import type { LLMAdapter, LLMMessage } from "../llm-adapters/types.js";
import type { ToolExecutor }           from "../mcp-tools/executor.js";
import { WALLET_TOOLS }                from "../mcp-tools/definitions.js";

const SYSTEM_PROMPT = `You are an autonomous agentic wallet for Fan Tokens on Chiliz Chain.

You help fans and developers interact with Fan Token payments, trading, governance, and rewards — autonomously, safely, and transparently.

Capabilities:
- Read wallet balances (CHZ + fan tokens)
- Calculate Hype Scores from match results and news
- Propose payments: direct, streaming micropayments, ticket purchases
- Propose token swaps on Chiliz Chain DEX
- Propose governance votes using fan token holdings
- Propose loyalty reward claims

How to behave:
- Always check get_policy before any transaction to understand available budget
- Always check get_hype_score before proposing a swap
- State your reasoning clearly — it is shown to the human for approval
- Be concise and data-driven — cite scores and numbers, not vague feelings
- If a guardrail blocks an action, explain it clearly and suggest an alternative
- Prefer caution — hold > buy when confidence is low
- For payments, always confirm the purpose and amount before proposing

Guardrails (enforced at execution — you cannot bypass them):
- Daily spend cap, per-tx limits, and approval thresholds are hard limits
- Human approval is required for transactions above the threshold
- A blocked action is not a failure — report and adapt

Chiliz Chain facts:
- Native token: CHZ (used for gas, 18 decimals)
- Fan tokens: ERC-20 with 0 decimals (whole units only)
- Supported: BAR, CITY, PSG, JUV, ACM (mainnet); more via community additions`;

export interface AgentRunOptions {
  llm:                 LLMAdapter;
  executor:            ToolExecutor;
  userMessage:         string;
  history?:            LLMMessage[];
  systemPromptAppend?: string;   // Use-case specific additions to the system prompt
  verbose?:            boolean;
}

export interface AgentRunResult {
  response:       string;
  updatedHistory: LLMMessage[];
  toolCallCount:  number;
  model:          string;
}

export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const { llm, executor, userMessage, verbose = false } = options;
  const system  = options.systemPromptAppend ? `${SYSTEM_PROMPT}\n\n${options.systemPromptAppend}` : SYSTEM_PROMPT;
  const history: LLMMessage[] = [...(options.history ?? []), { role: "user", content: userMessage }];
  const tools   = WALLET_TOOLS.map((t) => ({ name: t.name, description: t.description, input_schema: t.input_schema as any }));

  let toolCallCount = 0;

  for (let round = 0; round < 12; round++) {
    if (verbose) console.log(`\n[Agent/${llm.name}] Round ${round + 1}`);
    const res = await llm.chat({ system, messages: history, tools });
    history.push({ role: "assistant", content: res.content });

    if (res.stop_reason === "end_turn" || res.stop_reason === "stop") {
      const text = res.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
      return { response: text, updatedHistory: history, toolCallCount, model: llm.name };
    }

    if (res.stop_reason === "tool_use") {
      const calls = res.content.filter((b) => b.type === "tool_use");
      if (verbose) console.log(`[Agent] Tools: ${calls.map((c) => c.name).join(", ")}`);
      const results = await Promise.all(calls.map(async (c) => {
        toolCallCount++;
        const out = await executor.execute(c.name!, c.input ?? {});
        if (verbose) console.log(`  [${c.name}] →`, out.slice(0, 100));
        return { type: "tool_result" as const, tool_use_id: c.id!, content: out };
      }));
      history.push({ role: "user", content: results });
      continue;
    }
    break;
  }

  return { response: "[Agent] Max rounds reached.", updatedHistory: history, toolCallCount, model: llm.name };
}
