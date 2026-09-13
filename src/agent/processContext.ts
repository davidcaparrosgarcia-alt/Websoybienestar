import {
  deriveAgentCoarseUserState,
  isSoyBienestarInternalGuideContextEnabled,
  type AgentCoarseUserState,
  type AgentCoarseUserStateSignals,
} from "./userState";
import { readAgentCoarseUserStateSignals } from "../services/agentCoarseStateTransport";

export type AgentCoarseStateSignalReader = () => Promise<AgentCoarseUserStateSignals | null>;

/**
 * Phase 7B composition boundary.
 *
 * The transport returns only the privacy-safe signals defined by Phase 6.
 * This layer converts those signals into the deterministic coarse process state.
 * It does not receive Firebase tokens, UIDs, Firestore documents or private content.
 *
 * A null result means context is unavailable or deliberately disabled. Callers must
 * keep their existing deterministic behavior instead of treating null as authorization.
 */
export async function readAgentProcessContext(
  readSignals: AgentCoarseStateSignalReader = readAgentCoarseUserStateSignals,
  env?: Readonly<Record<string, unknown>>,
): Promise<AgentCoarseUserState | null> {
  if (!isSoyBienestarInternalGuideContextEnabled(env)) return null;

  const signals = await readSignals();
  if (!signals) return null;

  return deriveAgentCoarseUserState(signals);
}
