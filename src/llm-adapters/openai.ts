// src/llm-adapters/openai.ts
// OpenAI adapter. Also works with Azure OpenAI, Groq, Together, Ollama.
// Install peer dep: npm install openai
//
// .env:
//   LLM_PROVIDER=openai
//   OPENAI_API_KEY=sk-...
//   LLM_MODEL=gpt-4o
//   OPENAI_BASE_URL=https://...  (optional — for Azure or compatible endpoints)

import type { LLMAdapter, LLMMessage, LLMToolDefinition, LLMResponse, LLMContentBlock } from "./types.js";

export class OpenAIAdapter implements LLMAdapter {
  readonly name = "openai";
  private options: { apiKey?: string; model?: string; baseURL?: string };

  constructor(options: { apiKey?: string; model?: string; baseURL?: string } = {}) {
    this.options = options;
  }

  async chat(params: {
    system:    string;
    messages:  LLMMessage[];
    tools:     LLMToolDefinition[];
    maxTokens?: number;
  }): Promise<LLMResponse> {
    let OpenAI: any;
    try {
      // @ts-ignore — optional peer dependency
      const m = await import("openai");
      OpenAI = m.default;
    } catch {
      throw new Error('OpenAI adapter requires: npm install openai');
    }

    const client = new OpenAI({
      apiKey:  this.options.apiKey  ?? process.env.OPENAI_API_KEY,
      baseURL: this.options.baseURL ?? process.env.OPENAI_BASE_URL,
    });

    const model = this.options.model ?? process.env.LLM_MODEL ?? "gpt-4o";

    const messages = [
      { role: "system" as const, content: params.system },
      ...params.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string"
          ? m.content
          : (m.content as any[]).filter((b) => b.type === "text").map((b) => b.text ?? "").join(""),
      })),
    ];

    const tools = params.tools.map((t) => ({
      type: "function" as const,
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }));

    const res = await client.chat.completions.create({
      model, messages, tools, tool_choice: "auto",
      max_tokens: params.maxTokens ?? 4096,
    });

    const choice  = res.choices[0];
    const content: LLMContentBlock[] = [];
    if (choice.message.content) content.push({ type: "text", text: choice.message.content });
    for (const tc of choice.message.tool_calls ?? []) {
      content.push({ type: "tool_use", id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments) });
    }

    const stop = choice.finish_reason === "tool_calls" ? "tool_use"
               : choice.finish_reason === "length"     ? "length"
               : "end_turn";

    return { content, stop_reason: stop };
  }
}
