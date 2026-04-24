# Contributing

Thank you for contributing to the Fan Token Agentic Wallet Starter Kit. This kit is built to be forked, extended, and improved by the community.

---

## Ways to contribute

| What | Where |
|---|---|
| Add a fan token | `src/config/chains.ts` → `FAN_TOKENS` |
| Add an LLM adapter | `src/llm-adapters/my-model.ts` |
| Wire up a DEX | `src/mcp-tools/executor.ts` → `proposeSwap()` |
| Wire up governance | `src/mcp-tools/executor.ts` → `proposeVote()` |
| Add a payment type | `src/mcp-tools/definitions.ts` + `executor.ts` |
| Add a use case example | `examples/my-use-case/index.ts` |
| Improve documentation | `docs/` or `README.md` |
| Report a bug | Open a GitHub issue |

---

## Adding an LLM adapter

1. Create `src/llm-adapters/my-model.ts`
2. Implement `LLMAdapter` from `src/llm-adapters/types.ts`:

```typescript
export class MyModelAdapter implements LLMAdapter {
  readonly name = "my-model";
  async chat(params): Promise<LLMResponse> {
    // Call your model API
    // Return { content: LLMContentBlock[], stop_reason }
  }
}
```

3. Export from `src/llm-adapters/index.ts`
4. Add a case to `createAdapterFromEnv()`
5. Document env vars in `.env.example`

**Compatible models:** Any LLM with tool use / function calling support.

---

## Adding a fan token

```typescript
// src/config/chains.ts → FAN_TOKENS
NEWTOKEN: {
  symbol:  "NEWTOKEN",
  name:    "Club Name Fan Token",
  address: "0x...",    // Verify on scan.chiliz.com
  club:    "Club Name",
  sport:   "football",
  league:  "League Name",
  country: "Country",
},
```

Then add `"NEWTOKEN"` to the `enum` arrays in `src/mcp-tools/definitions.ts`.

---

## Adding a use case example

Copy an existing example folder and update:
- The header comment explaining **use case**, **purpose**, **who it's for**
- The `systemPromptAppend` with use-case context
- The `userMessage` with the specific task
- The `// NOTE: integrate X here` comments for production wiring

---

## PR checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] New env vars documented in `.env.example`
- [ ] New token addresses verified on Chiliz Chain explorer
- [ ] Examples still run
- [ ] README updated if adding a capability

---

## Code standards

- TypeScript strict mode — no untyped `any`
- Guardrails **must** run at execution layer, not inside the agent
- Every integration stub has a `// NOTE: integrate X here` comment
- Never log or hardcode private keys

MIT — fork freely, build commercially, give credit.
