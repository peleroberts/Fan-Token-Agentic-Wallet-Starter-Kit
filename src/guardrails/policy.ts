// src/guardrails/policy.ts
// Spend policy engine. Every write action passes through here before
// touching the chain. The LLM cannot bypass it — it runs at execution layer.

import { z } from "zod";

export type ActionType = "payment" | "swap" | "transfer" | "vote" | "stake" | "stream" | "claim" | "read";

export interface ProposedAction {
  type:        ActionType;
  description: string;
  amountChz?:  number;
  tokenSymbol?: string;
  reasoning:   string;
}

export type PolicyDecision =
  | { allowed: true;  requiresApproval: false }
  | { allowed: true;  requiresApproval: true; reason: string }
  | { allowed: false; reason: string };

export interface ActionLog {
  timestamp: Date;
  action:    ProposedAction;
  decision:  PolicyDecision;
  executed:  boolean;
  txHash?:   string;
}

export const PolicyConfigSchema = z.object({
  dailySpendCapChz:      z.number().positive().default(100),
  approvalThresholdChz:  z.number().positive().default(20),
  maxSingleTxChz:        z.number().positive().default(50),
  executionMode:         z.enum(["auto", "confirm"]).default("confirm"),
  allowedActionTypes:    z.array(z.enum(["payment","swap","transfer","vote","stake","stream","claim","read"])).default(["read","vote","payment","swap","claim","stream"]),
});

export type PolicyConfig = z.infer<typeof PolicyConfigSchema>;

export class GuardrailsPolicy {
  private config:         PolicyConfig;
  private log:            ActionLog[] = [];
  private todaySpend = 0;
  private lastReset:      string;

  constructor(config: Partial<PolicyConfig> = {}) {
    this.config    = PolicyConfigSchema.parse(config);
    this.lastReset = this.today();
  }

  private today() { return new Date().toISOString().split("T")[0]; }

  private maybeReset() {
    const t = this.today();
    if (t !== this.lastReset) { this.todaySpend = 0; this.lastReset = t; }
  }

  evaluate(action: ProposedAction): PolicyDecision {
    this.maybeReset();
    if (action.type === "read") return { allowed: true, requiresApproval: false };
    if (!this.config.allowedActionTypes.includes(action.type))
      return { allowed: false, reason: `Action type "${action.type}" is not permitted.` };

    const cost = action.amountChz ?? 0;
    if (cost > this.config.maxSingleTxChz)
      return { allowed: false, reason: `${cost} CHZ exceeds per-tx cap of ${this.config.maxSingleTxChz} CHZ.` };
    if (this.todaySpend + cost > this.config.dailySpendCapChz)
      return { allowed: false, reason: `Daily cap reached. Spent: ${this.todaySpend}/${this.config.dailySpendCapChz} CHZ.` };

    if (this.config.executionMode === "confirm")
      return { allowed: true, requiresApproval: true, reason: `Execution mode is "confirm".` };
    if (cost >= this.config.approvalThresholdChz)
      return { allowed: true, requiresApproval: true, reason: `${cost} CHZ meets approval threshold of ${this.config.approvalThresholdChz} CHZ.` };

    return { allowed: true, requiresApproval: false };
  }

  record(action: ProposedAction, txHash?: string) {
    this.maybeReset();
    this.todaySpend += action.amountChz ?? 0;
    this.log.push({ timestamp: new Date(), action, decision: { allowed: true, requiresApproval: false }, executed: true, txHash });
  }

  summary() {
    return {
      todaySpendChz:        this.todaySpend,
      dailyCapChz:          this.config.dailySpendCapChz,
      remainingChz:         this.config.dailySpendCapChz - this.todaySpend,
      executionMode:        this.config.executionMode,
      approvalThresholdChz: this.config.approvalThresholdChz,
    };
  }

  getLog() { return [...this.log]; }
}

export function createPolicyFromEnv(): GuardrailsPolicy {
  return new GuardrailsPolicy({
    dailySpendCapChz:     Number(process.env.DAILY_SPEND_CAP_CHZ     ?? 100),
    approvalThresholdChz: Number(process.env.APPROVAL_THRESHOLD_CHZ  ?? 20),
    executionMode:        (process.env.EXECUTION_MODE as "auto" | "confirm") ?? "confirm",
  });
}
