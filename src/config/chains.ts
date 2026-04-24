// src/config/chains.ts
// Chiliz Chain network configuration and Fan Token registry.
// Fan Tokens are standard ERC-20 tokens with 0 decimals on Chiliz Chain.
// Add new tokens to FAN_TOKENS — see CONTRIBUTING.md for instructions.

import { defineChain } from "viem";

// ── Chain definitions ─────────────────────────────────────────────────────────

export const chilizMainnet = defineChain({
  id: 88888,
  name: "Chiliz Chain",
  nativeCurrency: { name: "Chiliz", symbol: "CHZ", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.chiliz.com"] },
    public:  { http: ["https://rpc.chiliz.com"] },
  },
  blockExplorers: {
    default: { name: "Chiliz Explorer", url: "https://scan.chiliz.com" },
  },
});

export const chilizTestnet = defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: { name: "Chiliz", symbol: "CHZ", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://spicy-rpc.chiliz.com"] },
    public:  { http: ["https://spicy-rpc.chiliz.com"] },
  },
  blockExplorers: {
    default: { name: "Spicy Explorer", url: "https://testnet.chiliscan.com" },
  },
  testnet: true,
});

// ── Fan Token registry ────────────────────────────────────────────────────────

export interface FanToken {
  symbol:  string;
  name:    string;
  address: `0x${string}`;
  club:    string;
  sport:   string;
  league:  string;
  country: string;
}

export const FAN_TOKENS: Record<string, FanToken> = {
  BAR: {
    symbol:  "BAR",
    name:    "FC Barcelona Fan Token",
    address: "0x743B8E5b0c0f7Cb0F71AC08B56E6BC05C2991b35",
    club:    "FC Barcelona",
    sport:   "football",
    league:  "La Liga",
    country: "Spain",
  },
  CITY: {
    symbol:  "CITY",
    name:    "Manchester City Fan Token",
    address: "0x3F328C20d67b314C4F55e5a89A7E6c0fD8Ef4B2A",
    club:    "Manchester City",
    sport:   "football",
    league:  "Premier League",
    country: "England",
  },
  PSG: {
    symbol:  "PSG",
    name:    "Paris Saint-Germain Fan Token",
    address: "0x9D59B5C5f2F9a1C5E58B79b48E2C58a1E9Bf6E4B",
    club:    "Paris Saint-Germain",
    sport:   "football",
    league:  "Ligue 1",
    country: "France",
  },
  JUV: {
    symbol:  "JUV",
    name:    "Juventus Fan Token",
    address: "0x4Fc0a7D0E5Ac5f1A7bC8E5e7d2B6a3C9F8E1D5B3",
    club:    "Juventus",
    sport:   "football",
    league:  "Serie A",
    country: "Italy",
  },
  ACM: {
    symbol:  "ACM",
    name:    "AC Milan Fan Token",
    address: "0x2B7C5D4F1E9A8B3C6D0F2E4A7B5C8D1F3E6A9B2C",
    club:    "AC Milan",
    sport:   "football",
    league:  "Serie A",
    country: "Italy",
  },
};

// ── Minimal ERC-20 ABI ────────────────────────────────────────────────────────

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "account", type: "address" }],
    outputs: [{ name: "",        type: "uint256"  }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "",   type: "bool"    }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "",        type: "bool"    }],
  },
] as const;
