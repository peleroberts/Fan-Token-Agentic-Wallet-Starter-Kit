// src/llm-adapters/claude.ts
// Anthropic Claude adapter.
// Recommended for agentic wallet use — strong reasoning and tool use accuracy.

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages/messages.js";
import type { LLMAdapter, LLMMessage, LLMToolDefinition, LLMResponse, LLMContentBlock } from "./types.js";

export class ClaudeAdapter implements LLMAdapter {
  readonly name = "claude";
  private client: Anthropic;
  private model:  string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.model  = options.model ?? process.env.LLM_MODEL ?? "claude-sonnet-4-5";
  }

  async chat(params: {
    system:    string;
    messages:  LLMMessage[];
    tools:     LLMToolDefinition[];
    maxTokens?: number;
  }): Promise<LLMResponse> {
    const res = await this.client.messages.create({
      model:      this.model,
      max_tokens: params.maxTokens ?? 4096,
      system:     params.system,
      tools:      params.tools as Tool[],
      messages:   params.messages as MessageParam[],
    });

    const content: LLMContentBlock[] = res.content.map((b) => {
      if (b.type === "text")     return { type: "text"     as const, text: b.text };
      if (b.type === "tool_use") return { type: "tool_use" as const, id: b.id, name: b.name, input: b.input as Record<string, unknown> };
      return { type: "text" as const, text: "" };
    });

    const stop = res.stop_reason === "tool_use" ? "tool_use"
               : res.stop_reason === "max_tokens" ? "length"
               : "end_turn";

    return { content, stop_reason: stop };
  }
}
