// src/llm-adapters/types.ts
// The LLMAdapter interface. The agent loop depends on this abstraction only —
// not on any specific provider SDK. This means any LLM can power the wallet.
//
// Implement this interface to add your own model:
//   1. Create src/llm-adapters/my-model.ts
//   2. Implement LLMAdapter
//   3. Export from src/llm-adapters/index.ts
//   4. Add a case to createAdapterFromEnv()

export interface LLMMessage {
  role:    "user" | "assistant";
  content: string | LLMContentBlock[];
}

export interface LLMContentBlock {
  type:        "text" | "tool_use" | "tool_result";
  text?:       string;
  id?:         string;
  name?:       string;
  input?:      Record<string, unknown>;
  tool_use_id?: string;
  content?:    string;
}

export interface LLMToolDefinition {
  name:         string;
  description:  string;
  input_schema: {
    type:        "object";
    properties:  Record<string, unknown>;
    required?:   string[];
  };
}

export interface LLMResponse {
  content:     LLMContentBlock[];
  stop_reason: "end_turn" | "tool_use" | "stop" | "length";
}

/**
 * Implement this to connect any LLM to the starter kit.
 *
 * Built-in adapters:
 *   ClaudeAdapter  (Anthropic)  → src/llm-adapters/claude.ts
 *   OpenAIAdapter  (OpenAI)     → src/llm-adapters/openai.ts
 *
 * Compatible out-of-the-box via OpenAI adapter + OPENAI_BASE_URL:
 *   Azure OpenAI · Groq · Together AI · Ollama (with tool-use models)
 */
export interface LLMAdapter {
  readonly name: string;
  chat(params: {
    system:    string;
    messages:  LLMMessage[];
    tools:     LLMToolDefinition[];
    maxTokens?: number;
  }): Promise<LLMResponse>;
}
