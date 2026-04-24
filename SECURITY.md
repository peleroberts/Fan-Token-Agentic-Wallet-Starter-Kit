# Security

## Private key safety

**Never commit a real private key.** The `.env` file is in `.gitignore` for this reason.

For development: create a dedicated test wallet with a small amount of Spicy testnet CHZ from the [faucet](https://spicy-faucet.chiliz.com). Treat it as disposable.

For production: replace `createWalletFromEnv()` in `src/wallet/client.ts` with a proper secrets manager or MPC wallet:
- [Turnkey](https://www.turnkey.com) — MPC-based key management
- [Privy](https://www.privy.io) — embedded wallet infrastructure
- [Fireblocks](https://www.fireblocks.com) — institutional-grade MPC

## Guardrails

The spend policy in `src/guardrails/policy.ts` is enforced at the execution layer — the LLM cannot bypass it regardless of what it generates. Always start with:
- `EXECUTION_MODE=confirm` — requires human approval before every transaction
- Low `DAILY_SPEND_CAP_CHZ` — start at 10 CHZ, raise only when confident

## Smart contract addresses

Fan token contract addresses in `src/config/chains.ts` are **placeholders for illustration**. Before using on mainnet, verify every address against the [Chiliz Chain explorer](https://scan.chiliz.com).

## Reporting vulnerabilities

If you find a security issue, please open a GitHub issue marked `[SECURITY]` or email the maintainers directly. Do not post exploit details publicly.
