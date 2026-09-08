import type { AgentArrivalStorage } from "./arrivalContext";
import {
  executeAgentCapabilityRequest,
  type AgentCapabilityExecutionResult,
} from "./appExecutor";
import type {
  AgentCapabilityRequest,
  AgentNavigationPath,
} from "./types";

export type InternalGuideSectionId =
  | "guides"
  | "tools"
  | "services"
  | "process";

export interface InternalGuideAction {
  readonly id: string;
  readonly label: string;
  readonly request: AgentCapabilityRequest;
}

export interface InternalGuideSection {
  readonly id: InternalGuideSectionId;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly actions: readonly InternalGuideAction[];
}

export interface ExecuteInternalGuideActionOptions {
  readonly navigate: (path: AgentNavigationPath) => void;
  readonly storage?: AgentArrivalStorage;
  readonly now?: () => number;
}

export type InternalGuideExecutionResult =
  | AgentCapabilityExecutionResult
  | { readonly status: "UNKNOWN_ACTION" };

export const INTERNAL_GUIDE_SECTIONS = [
  {
    id: "guides",
    title: "Guías por tema",
    description: "Ansiedad, estrés, sueño y otros temas de bienestar.",
    icon: "menu_book",
    actions: [
      {
        id: "guide_anxiety",
        label: "Ansiedad",
        request: { capabilityId: "sb.open_guide", input: { topic: "anxiety" } },
      },
      {
        id: "guide_stress",
        label: "Estrés",
        request: { capabilityId: "sb.open_guide", input: { topic: "stress" } },
      },
      {
        id: "guide_insomnia",
        label: "Insomnio",
        request: { capabilityId: "sb.open_guide", input: { topic: "insomnia" } },
      },
      {
        id: "guide_procrastination",
        label: "Procrastinación",
        request: { capabilityId: "sb.open_guide", input: { topic: "procrastination" } },
      },
      {
        id: "guide_rumination",
        label: "Pensar demasiado / rumiación",
        request: { capabilityId: "sb.open_guide", input: { topic: "rumination" } },
      },
      {
        id: "guide_emotional_management",
        label: "Gestión emocional",
        request: { capabilityId: "sb.open_guide", input: { topic: "emotional_management" } },
      },
      {
        id: "guide_emotional_eating",
        label: "Alimentación emocional",
        request: { capabilityId: "sb.open_guide", input: { topic: "emotional_eating" } },
      },
    ],
  },
  {
    id: "tools",
    title: "Herramientas",
    description: "Meditaciones, respiración, autoobservación y hábitos.",
    icon: "self_improvement",
    actions: [
      {
        id: "tool_meditations",
        label: "Meditaciones",
        request: { capabilityId: "sb.open_wellbeing_tool", input: { tool: "meditations" } },
      },
      {
        id: "tool_breathing",
        label: "Respiración",
        request: { capabilityId: "sb.open_wellbeing_tool", input: { tool: "breathing" } },
      },
      {
        id: "tool_emotional_scan",
        label: "Escaneo emocional",
        request: { capabilityId: "sb.open_wellbeing_tool", input: { tool: "emotional_scan" } },
      },
      {
        id: "tool_gratitude_diary",
        label: "Diario de gratitud",
        request: { capabilityId: "sb.open_wellbeing_tool", input: { tool: "gratitude_diary" } },
      },
      {
        id: "tool_weekly_goals",
        label: "Metas semanales",
        request: { capabilityId: "sb.open_wellbeing_tool", input: { tool: "weekly_goals" } },
      },
    ],
  },
  {
    id: "services",
    title: "Servicios",
    description: "Tratamientos, programas, método y equipo.",
    icon: "spa",
    actions: [
      {
        id: "service_treatments",
        label: "Tratamientos online",
        request: { capabilityId: "sb.open_service", input: { service: "treatments" } },
      },
      {
        id: "service_reprogramate",
        label: "ReprogrÁmate",
        request: { capabilityId: "sb.open_service", input: { service: "reprogramate" } },
      },
      {
        id: "service_hipnodigest",
        label: "HipnoDigest",
        request: { capabilityId: "sb.open_service", input: { service: "hipnodigest" } },
      },
      {
        id: "service_method",
        label: "Cómo trabajamos",
        request: { capabilityId: "sb.open_service", input: { service: "method" } },
      },
      {
        id: "service_about",
        label: "Quiénes somos",
        request: { capabilityId: "sb.open_service", input: { service: "about" } },
      },
    ],
  },
  {
    id: "process",
    title: "Tu proceso",
    description: "Accesos a consulta, cuestionario y dosier.",
    icon: "route",
    actions: [
      {
        id: "process_free_consultation",
        label: "Consulta gratuita",
        request: { capabilityId: "sb.start_free_consultation" },
      },
      {
        id: "process_questionnaire",
        label: "Siguiente paso del cuestionario",
        request: { capabilityId: "sb.open_questionnaire_step" },
      },
      {
        id: "process_dossier",
        label: "Acceder a mi dosier",
        request: { capabilityId: "sb.open_dossier" },
      },
    ],
  },
] as const satisfies readonly InternalGuideSection[];

export const INTERNAL_GUIDE_ACTIONS: readonly InternalGuideAction[] =
  INTERNAL_GUIDE_SECTIONS.reduce<InternalGuideAction[]>((actions, section) => {
    actions.push(...section.actions);
    return actions;
  }, []);

function readBuildEnvironment(): Readonly<Record<string, unknown>> | undefined {
  return (import.meta as ImportMeta & { readonly env?: Readonly<Record<string, unknown>> }).env;
}

export function isSoyBienestarInternalGuideEnabled(
  env: Readonly<Record<string, unknown>> | undefined = readBuildEnvironment(),
): boolean {
  return env?.VITE_INTERNAL_GUIDE_ENABLED !== "false";
}

export function findInternalGuideAction(actionId: unknown): InternalGuideAction | null {
  if (typeof actionId !== "string") return null;
  return INTERNAL_GUIDE_ACTIONS.find((action) => action.id === actionId) ?? null;
}

export function executeInternalGuideAction(
  actionId: unknown,
  options: ExecuteInternalGuideActionOptions,
): InternalGuideExecutionResult {
  const action = findInternalGuideAction(actionId);
  if (!action) return { status: "UNKNOWN_ACTION" };

  return executeAgentCapabilityRequest(action.request, {
    source: "internal_guide",
    navigate: options.navigate,
    storage: options.storage,
    now: options.now,
  });
}
