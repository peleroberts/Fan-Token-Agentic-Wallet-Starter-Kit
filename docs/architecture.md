# Architecture

## Overview

The kit is built in four independent layers. Each layer can be replaced without touching the others.

```
┌──────────────────────────────────────────────────────┐
│                    LLM Adapter Layer                 │
│   Claude · OpenAI · Gemini · Ollama · Custom         │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                    Agent Loop                        │
│   System prompt · Tool use · Multi-turn history      │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                  Tool Executor                       │
│   Guardrails policy · Human approval · Tool routing  │
└─────────┬────────────┬────────────┬──────────────────┘
          │            │            │
   ┌──────▼───┐  ┌─────▼────┐  ┌───▼──────────┐
   │  Wallet  │  │  Sports  │  │  Guardrails  │
   │  (viem)  │  │  Data    │  │  Policy      │
   └──────────┘  └──────────┘  └──────────────┘
          │
┌─────────▼────────────────────────────────────────────┐
│                  Chiliz Chain (EVM)                  │
│   CHZ · BAR · CITY · PSG · JUV · ACM                │
└──────────────────────────────────────────────────────┘
```

## Layer responsibilities

**LLM Adapter** (`src/llm-adapters/`) — Normalises any LLM API into a single `chat()` interface. The agent loop never imports a specific SDK — only this interface.

**Agent Loop** (`src/agent/loop.ts`) — Sends the system prompt and conversation history to the LLM. Handles multi-round tool use. Stops when the LLM returns a final text response.

**Tool Executor** (`src/mcp-tools/executor.ts`) — Maps tool calls from the LLM to real wallet/data operations. Every write action is evaluated by the guardrails policy before execution. If approval is required, prompts the human via CLI.

**Wallet** (`src/wallet/client.ts`) — Wraps `viem` for Chiliz Chain. Reads balances, sends transactions. Swap `createWalletFromEnv()` for an MPC/TEE signer in production.

**Guardrails Policy** (`src/guardrails/policy.ts`) — Enforces daily spend caps, per-tx limits, and approval thresholds. Runs at the execution layer — the LLM cannot bypass it.

## Key design decisions

**LLM-agnostic from day one** — The `LLMAdapter` interface was designed first, not retrofitted. This means Claude, OpenAI, and future models are all equal citizens.

**Guardrails at execution, not agent** — Safety constraints are enforced in `ToolExecutor`, not in the system prompt. Prompt-level guardrails can be jailbroken; execution-layer guardrails cannot.

**Tools as the agent's vocabulary** — The agent's capabilities are defined entirely by the tools in `src/mcp-tools/definitions.ts`. Adding a capability means adding a tool definition and an executor handler — nothing else changes.

**Mock-first data** — All external data (sports feed, DEX prices, governance proposals) falls back to mock data. This means the kit runs from first clone without any API keys.

**Integration stubs are explicit** — Every unimplemented integration has a `// NOTE: integrate X here` comment with a code example. Nothing is silently missing.
