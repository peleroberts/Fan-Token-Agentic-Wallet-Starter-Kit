# Fan Token Agentic Wallet Starter Kit

**Build AI-powered wallets for Fan Tokens on Chiliz Chain.**  
Open source · TypeScript · Any LLM · MIT License

---

## What is this?

An open-source starter kit for developers building **agentic wallets** — AI agents that autonomously manage Fan Token payments, governance, rewards, and trading on Chiliz Chain.

This is a **starting point, not a finished product**. Fork it, wire in your own integrations, and build your use case on top of a solid, well-documented foundation.

---

## Use cases

| Example | What it does | Run |
|---|---|---|
| **Match-Day Wallet** | Detects match day, proposes ticket/stream purchase | `npm run example:matchday` |
| **Streaming Payments** | Pay-per-minute CHZ stream for exclusive content | `npm run example:streaming` |
| **Governance Agent** | Reads proposals, votes based on fan preferences | `npm run example:governance` |
| **Loyalty Rewards** | Monitors and auto-claims available rewards | `npm run example:loyalty` |
| **Multi-Club Portfolio** | Hype-scores BAR, CITY, PSG — rebalances if signal is clear | `npm run example:portfolio` |

Each example includes a full header comment explaining the use case, who it's for, and exactly what to wire up for production.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/your-org/fan-token-agentic-wallet-starter-kit
cd fan-token-agentic-wallet-starter-kit

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Set: LLM_PROVIDER, ANTHROPIC_API_KEY (or OPENAI_API_KEY), WALLET_PRIVATE_KEY

# 4. Run interactive agent
npm run dev

# 5. Run a use case example
npm run example:matchday
```

The kit runs on **mock data out of the box** — no API keys required to explore it.

---

## Choosing your LLM

Set `LLM_PROVIDER` in `.env`. Any model with tool use / function calling support works.

| Provider | `LLM_PROVIDER` | Env var | Default model |
|---|---|---|---|
| Anthropic Claude *(recommended)* | `claude` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-5` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o` |
| Azure OpenAI | `openai` | `OPENAI_API_KEY` + `OPENAI_BASE_URL` | your deployment |
| Groq / Together / Ollama | `openai` | `OPENAI_API_KEY` + `OPENAI_BASE_URL` | your model |
| Custom | implement `LLMAdapter` | — | — |

To add your own adapter: implement `LLMAdapter` in `src/llm-adapters/types.ts`. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Architecture

```
src/
├── llm-adapters/      ← LLMAdapter interface + Claude, OpenAI adapters
├── agent/             ← Multi-turn agent loop (LLM-agnostic)
├── mcp-tools/         ← Tool definitions + executor (payments, swaps, votes)
├── wallet/            ← Chiliz Chain wallet client (viem)
├── guardrails/        ← Spend policy engine (enforced at execution layer)
├── data/              ← Sports feed + Hype Score calculator
├── config/            ← Chain config + Fan Token registry
└── index.ts           ← Interactive REPL

examples/
├── match-day-wallet/
├── streaming-payments/
├── governance-agent/
├── loyalty-rewards/
└── multi-club-portfolio/

docs/                  ← Architecture docs
```

---

## Payment capabilities

| Tool | Type | Status |
|---|---|---|
| `propose_payment` | Direct CHZ payment | ✅ Ready |
| `propose_stream_payment` | Pay-per-minute stream | ✅ Ready (stub — wire streaming protocol) |
| `propose_swap` | DEX token swap | ✅ Ready (stub — wire DEX router) |
| `propose_vote` | Governance vote | ✅ Ready (stub — wire governance contract) |
| `propose_claim_reward` | Loyalty reward claim | ✅ Ready (stub — wire rewards contract) |

Stubs have clear `// NOTE: integrate X here` comments with code examples.

---

## Guardrails

Spend limits are **enforced at the execution layer** — the LLM cannot bypass them.

| Setting | Env var | Default |
|---|---|---|
| Daily spend cap | `DAILY_SPEND_CAP_CHZ` | 100 CHZ |
| Approval threshold | `APPROVAL_THRESHOLD_CHZ` | 20 CHZ |
| Execution mode | `EXECUTION_MODE` | `confirm` |

`confirm` = always ask before transacting. `auto` = act within caps.  
Start with `confirm`. Switch to `auto` only when fully tested.

---

## Fan Token Registry

| Token | Club | League |
|---|---|---|
| BAR | FC Barcelona | La Liga |
| CITY | Manchester City | Premier League |
| PSG | Paris Saint-Germain | Ligue 1 |
| JUV | Juventus | Serie A |
| ACM | AC Milan | Serie A |

To add a token: see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Chiliz Chain

| | Mainnet | Spicy Testnet |
|---|---|---|
| Chain ID | 88888 | 88882 |
| RPC | `https://rpc.chiliz.com` | `https://spicy-rpc.chiliz.com` |
| Explorer | [scan.chiliz.com](https://scan.chiliz.com) | [testnet.chiliscan.com](https://testnet.chiliscan.com) |
| Faucet | — | [spicy-faucet.chiliz.com](https://spicy-faucet.chiliz.com) |
| EVM | Shanghai / Solidity 0.8.24 | same |

---

## Roadmap

- [ ] Live DEX swap integration
- [ ] Governance contract integration
- [ ] Streaming protocol integration (Superfluid / Sablier)
- [ ] Google Gemini LLM adapter
- [ ] Ollama adapter (local models)
- [ ] Additional fan tokens
- [ ] On-chain price feed integration
- [ ] Turnkey / Privy production wallet adapters
- [ ] Next.js dashboard
- [ ] Webhook triggers (match result → agent action)

---

## Security

See [SECURITY.md](./SECURITY.md). Short version:

- Never commit a real private key — use a dev wallet on Spicy testnet
- Verify all contract addresses on [scan.chiliz.com](https://scan.chiliz.com) before mainnet use
- Start with `EXECUTION_MODE=confirm` and low spend caps

---

## Publishing to GitHub

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for commit titles, release notes, and tags.

**To upload via GitHub browser (no command line needed):**

1. Go to [github.com](https://github.com) and sign in
2. Click **+** (top right) → **New repository**
3. Name it `fan-token-agentic-wallet-starter-kit`
4. Set to **Public**, tick **Add a README** = OFF (you have one already)
5. Click **Create repository**
6. On the empty repo page, click **uploading an existing file**
7. Drag and drop all project files/folders into the upload area
8. In the **Commit changes** box at the bottom, paste the commit title from `INSTRUCTIONS.md`
9. Click **Commit changes**
10. Go to **Releases** (right sidebar) → **Draft a new release**
11. Tag: `v1.0.0` · Title and notes: copy from `INSTRUCTIONS.md`
12. Click **Publish release**

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All contributions welcome.

---

## Licence

[MIT](./LICENSE) — fork freely, build commercially, give credit.

---

*Not affiliated with Chiliz, Socios.com, or any football club.*
