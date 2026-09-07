import { createAgentArrivalContext, saveAgentArrivalContext } from "./arrivalContext";
import type { AgentArrivalSource, AgentArrivalStorage } from "./arrivalContext";
import { resolveAgentCapabilityRequest } from "./runtime";
import type {
  AgentCapabilityId,
  AgentCapabilityPlan,
  AgentCapabilityResult,
  AgentNavigationPath,
} from "./types";

export interface ExecuteAgentCapabilityOptions {
  readonly source: AgentArrivalSource;
  readonly navigate: (path: AgentNavigationPath) => void;
  readonly storage?: AgentArrivalStorage;
  readonly now?: () => number;
}

export type AgentCapabilityExecutionResult =
  | Exclude<AgentCapabilityResult, { readonly status: "ALLOWED" }>
  | {
      readonly status: "NAVIGATED";
      readonly capabilityId: AgentCapabilityId;
      readonly plan: AgentCapabilityPlan;
      readonly arrivalContextSaved: boolean;
    };

export function executeAgentCapabilityRequest(
  request: unknown,
  options: ExecuteAgentCapabilityOptions,
): AgentCapabilityExecutionResult {
  const result = resolveAgentCapabilityRequest(request);
  if (result.status !== "ALLOWED") return result;

  const context = createAgentArrivalContext(
    {
      source: options.source,
      capabilityId: result.capabilityId,
      targetPath: result.plan.effect.path,
      entryPoint: result.plan.effect.entryPoint,
    },
    options.now?.() ?? Date.now(),
  );
  const arrivalContextSaved = saveAgentArrivalContext(context, options.storage);

  options.navigate(result.plan.effect.path);

  return {
    status: "NAVIGATED",
    capabilityId: result.capabilityId,
    plan: result.plan,
    arrivalContextSaved,
  };
}
