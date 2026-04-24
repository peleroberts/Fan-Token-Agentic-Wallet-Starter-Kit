# Maintainer Instructions
# Fan Token Agentic Wallet Starter Kit

This file is the single reference for release management and GitHub publishing.
Keep it updated as the project evolves.

---

## Versioning convention

This project uses semantic versioning: MAJOR.MINOR.PATCH

| Change type | Version bump | Example |
|---|---|---|
| Breaking change to core API | MAJOR | 1.0.0 → 2.0.0 |
| New feature, new example, new adapter | MINOR | 1.0.0 → 1.1.0 |
| Bug fix, docs update, typo | PATCH | 1.0.0 → 1.0.1 |

---

## Release checklist (run before every release)

1. [ ] All code changes committed and pushed
2. [ ] `npm run typecheck` passes — zero errors
3. [ ] All examples run without crashing
4. [ ] `package.json` version updated
5. [ ] CHANGELOG.md updated (if you maintain one)
6. [ ] `.env.example` reflects any new env vars
7. [ ] README updated if any capability changed

---

## Version 1.0.0 — Initial Release

### Git commit title
```
feat: initial release of Fan Token Agentic Wallet Starter Kit v1.0.0
```

### Git commit summary (body)
```
Open-source TypeScript starter kit for building agentic wallets for
Fan Tokens on Chiliz Chain. Bring your own LLM.

Features:
- LLM-agnostic adapter layer: Claude (default) + OpenAI built-in
- Chiliz Chain wallet via viem (mainnet + Spicy testnet)
- Fan Token registry: BAR, CITY, PSG, JUV, ACM
- Hype Score engine: match results + news → 0–100 signal
- Guardrails policy: daily caps, approval thresholds, confirm/auto modes
- Payment tools: direct payments, streaming micropayments
- Trading tools: DEX swap proposals (stubbed, ready to wire)
- Governance tools: on-chain vote proposals (stubbed, ready to wire)
- Loyalty tools: reward and airdrop claim proposals (stubbed)
- 5 use case examples: match-day wallet, streaming payments,
  governance agent, loyalty rewards, multi-club portfolio
- Architecture docs, SECURITY.md, CONTRIBUTING.md, issue templates
- GitHub Pages landing page (docs/index.html)

Integration stubs with clear // NOTE comments:
- DEX router swap execution
- Governance contract vote submission
- Reward/airdrop contract claims
- Streaming protocol (Superfluid/Sablier)

Closes #1
```

### Release tag
```
v1.0.0
```

### Release title
```
Fan Token Agentic Wallet Starter Kit — v1.0.0
```

### Release notes (paste into GitHub Releases)
```
## Fan Token Agentic Wallet Starter Kit v1.0.0

First public release.

An open-source TypeScript scaffold for developers building AI-powered
agentic wallets for Fan Tokens on Chiliz Chain.

### What's included

**Core architecture**
- LLM-agnostic adapter layer — Claude and OpenAI built-in, any model via interface
- Chiliz Chain wallet client (viem) — mainnet + Spicy testnet
- Fan Token registry: BAR, CITY, PSG, JUV, ACM
- Guardrails policy engine — enforced at execution layer

**Payment capabilities**
- Direct CHZ payments
- Streaming micropayments (pay-per-minute model)
- DEX token swaps (stubbed — integration points documented)
- Governance votes (stubbed)
- Loyalty reward claims (stubbed)

**Use case examples**
- `npm run example:matchday`   — Match-Day Wallet (ticket + stream purchase)
- `npm run example:streaming`  — Streaming Micropayments (pay-per-view content)
- `npm run example:governance` — Governance Agent (autonomous voting)
- `npm run example:loyalty`    — Loyalty Rewards (auto-claim rewards)
- `npm run example:portfolio`  — Multi-Club Portfolio Manager

### Quick start

git clone https://github.com/your-org/fan-token-agentic-wallet-starter-kit
cd fan-token-agentic-wallet-starter-kit
npm install
cp .env.example .env
npm run dev

### Notes

Fan token contract addresses in src/config/chains.ts are illustrative.
Verify against scan.chiliz.com before mainnet use.

DEX swap, governance, and rewards execution are stubbed with clear
integration points. See CONTRIBUTING.md to wire them up.

### What's next (community contributions welcome)
- Live DEX integration
- Governance contract integration
- Google Gemini adapter
- Ollama adapter
- More fan tokens
- Next.js dashboard
```

---

## Template for future releases

Copy and fill in for each new version:

### Git commit title
```
feat: [short description] — v[X.Y.Z]
```

### Git commit summary
```
[2–3 sentences describing what changed and why]

Added:
- [feature]

Fixed:
- [bug]

Breaking changes:
- [if any]
```

### Release tag
```
v[X.Y.Z]
```

### Release title
```
Fan Token Agentic Wallet Starter Kit — v[X.Y.Z]
```

### Release notes
```
## v[X.Y.Z]

### Added
- [feature]

### Fixed
- [bug]

### Breaking changes
- [if any]

### Upgrade from v[previous]
[migration notes if needed]
```

---

## How to upload to GitHub (browser method)

See the section at the bottom of README.md titled "Publishing to GitHub".
Full step-by-step instructions with screenshots guidance are there.

---

## Repository URLs to update before publishing

Search for `your-org` and replace with your actual GitHub username or org:
- `package.json` → `"repository.url"`
- `README.md` → clone URL and badge links
- `CONTRIBUTING.md` → issue tracker link
