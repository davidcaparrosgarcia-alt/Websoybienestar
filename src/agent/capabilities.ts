import type {
  AgentCapabilityDescriptor,
  AgentCapabilityId,
  AgentGuideTopic,
  AgentNavigationEffect,
  AgentService,
  AgentWellbeingTool,
} from "./types";

export const AGENT_CAPABILITY_IDS = [
  "sb.open_guide",
  "sb.open_wellbeing_tool",
  "sb.open_service",
  "sb.start_free_consultation",
  "sb.open_questionnaire_step",
  "sb.open_dossier",
  "sb.open_emotional_course",
] as const satisfies readonly AgentCapabilityId[];

export const AGENT_CAPABILITY_CATALOG = [
  { id: "sb.open_guide", riskLevels: ["R0"], availability: "available", authRequirement: "none" },
  { id: "sb.open_wellbeing_tool", riskLevels: ["R0", "R1"], availability: "available", authRequirement: "input_dependent" },
  { id: "sb.open_service", riskLevels: ["R0"], availability: "available", authRequirement: "none" },
  { id: "sb.start_free_consultation", riskLevels: ["R1"], availability: "available", authRequirement: "required" },
  { id: "sb.open_questionnaire_step", riskLevels: ["R1"], availability: "available", authRequirement: "required" },
  { id: "sb.open_dossier", riskLevels: ["R1"], availability: "available", authRequirement: "required" },
  {
    id: "sb.open_emotional_course",
    riskLevels: ["R1"],
    availability: "unavailable",
    authRequirement: "required",
    futurePath: "/emocionario",
  },
] as const satisfies readonly AgentCapabilityDescriptor[];

export const GUIDE_DESTINATIONS = {
  anxiety: "/ansiedad",
  stress: "/estres",
  insomnia: "/insomnio",
  procrastination: "/procrastinacion",
  rumination: "/pensar-demasiado-rumiacion",
  emotional_management: "/gestion-emocional",
  emotional_eating: "/alimentacion-emocional",
} as const satisfies Readonly<Record<AgentGuideTopic, AgentNavigationEffect["path"]>>;

export const WELLBEING_TOOL_PLANS = {
  meditations: {
    riskLevel: "R0",
    requiresAuth: false,
    effect: { kind: "navigate", path: "/herramientas", entryPoint: "meditations" },
  },
  breathing: {
    riskLevel: "R0",
    requiresAuth: false,
    effect: { kind: "navigate", path: "/herramientas", entryPoint: "breathing" },
  },
  emotional_scan: {
    riskLevel: "R0",
    requiresAuth: false,
    effect: { kind: "navigate", path: "/herramientas", entryPoint: "emotional_scan" },
  },
  anxiety_check: {
    riskLevel: "R0",
    requiresAuth: false,
    effect: { kind: "navigate", path: "/anxiety" },
  },
  gratitude_diary: {
    riskLevel: "R1",
    requiresAuth: true,
    effect: { kind: "navigate", path: "/emotion-diary" },
  },
  weekly_goals: {
    riskLevel: "R1",
    requiresAuth: true,
    effect: { kind: "navigate", path: "/weekly-goals" },
  },
} as const satisfies Readonly<
  Record<
    AgentWellbeingTool,
    {
      readonly riskLevel: "R0" | "R1";
      readonly requiresAuth: boolean;
      readonly effect: AgentNavigationEffect;
    }
  >
>;

export const SERVICE_DESTINATIONS = {
  treatments: "/tratamientos-online",
  reprogramate: "/reprogramate",
  hipnodigest: "/hipnodigest",
  method: "/como-trabajamos",
  about: "/quienes-somos",
} as const satisfies Readonly<Record<AgentService, AgentNavigationEffect["path"]>>;

export const FREE_CONSULTATION_EFFECT = {
  kind: "navigate",
  path: "/session",
} as const satisfies AgentNavigationEffect;

export const QUESTIONNAIRE_STEP_EFFECT = {
  kind: "navigate",
  path: "/report",
  entryPoint: "questionnaire_next_step",
} as const satisfies AgentNavigationEffect;

export const DOSSIER_EFFECT = {
  kind: "navigate",
  path: "/dossier-espejo",
} as const satisfies AgentNavigationEffect;
