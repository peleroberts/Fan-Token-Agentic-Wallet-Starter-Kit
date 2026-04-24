// src/wallet/client.ts
// Chiliz Chain wallet using viem. Reads balances, signs transactions.
// For production: swap createWalletFromEnv() for Turnkey / Privy / Fireblocks.

import {
  createPublicClient, createWalletClient, http,
  formatEther, parseEther,
  type PublicClient, type WalletClient, type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chilizMainnet, chilizTestnet, ERC20_ABI, type FanToken } from "../config/chains.js";

export interface WalletConfig {
  privateKey: `0x${string}`;
  network:    "mainnet" | "testnet";
  rpcUrl?:    string;
}

export class ChilizWallet {
  public readonly publicClient: PublicClient;
  public readonly walletClient: WalletClient;
  public readonly address:      Address;
  public readonly network:      "mainnet" | "testnet";

  constructor(config: WalletConfig) {
    const chain  = config.network === "mainnet" ? chilizMainnet : chilizTestnet;
    const rpcUrl = config.rpcUrl ?? (config.network === "mainnet"
      ? "https://rpc.chiliz.com"
      : "https://spicy-rpc.chiliz.com");
    const account = privateKeyToAccount(config.privateKey);

    this.address      = account.address;
    this.network      = config.network;
    this.publicClient = createPublicClient({ chain, transport: http(rpcUrl) }) as PublicClient;
    this.walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
  }

  async getChzBalance(): Promise<string> {
    const raw = await this.publicClient.getBalance({ address: this.address });
    return formatEther(raw);
  }

  async getFanTokenBalance(token: FanToken): Promise<bigint> {
    return await this.publicClient.readContract({
      address:      token.address as Address,
      abi:          ERC20_ABI,
      functionName: "balanceOf",
      args:         [this.address],
    });
  }

  async transferChz(to: Address, amountChz: string): Promise<`0x${string}`> {
    const chain = this.network === "mainnet" ? chilizMainnet : chilizTestnet;
    return await this.walletClient.sendTransaction({
      to, value: parseEther(amountChz),
      account: this.walletClient.account!,
      chain,
    });
  }

  async waitForTx(hash: `0x${string}`) {
    return await this.publicClient.waitForTransactionReceipt({ hash });
  }
}

export function createWalletFromEnv(): ChilizWallet {
  const key = process.env.WALLET_PRIVATE_KEY;
  if (!key?.startsWith("0x")) throw new Error("WALLET_PRIVATE_KEY not set — see .env.example");
  return new ChilizWallet({
    privateKey: key as `0x${string}`,
    network:    (process.env.NETWORK as "mainnet" | "testnet") ?? "testnet",
    rpcUrl:     process.env.NETWORK === "mainnet" ? process.env.CHILIZ_RPC_URL : process.env.CHILIZ_TESTNET_RPC_URL,
  });
}
