// src/llm-adapters/index.ts
export type { LLMAdapter, LLMMessage, LLMContentBlock, LLMToolDefinition, LLMResponse } from "./types.js";
export { ClaudeAdapter  } from "./claude.js";
export { OpenAIAdapter  } from "./openai.js";

export async function createAdapterFromEnv() {
  const provider = (process.env.LLM_PROVIDER ?? "claude").toLowerCase();
  if (provider === "claude" || provider === "anthropic") {
    const { ClaudeAdapter } = await import("./claude.js");
    return new ClaudeAdapter();
  }
  if (provider === "openai" || provider === "azure") {
    const { OpenAIAdapter } = await import("./openai.js");
    return new OpenAIAdapter();
  }
  throw new Error(`Unknown LLM_PROVIDER: "${provider}". Supported: claude, openai.\nSee src/llm-adapters/types.ts to implement a custom adapter.`);
}
