export type AgentRiskLevel = "R0" | "R1" | "R2" | "R3" | "R4";

export type AgentCapabilityId =
  | "sb.open_guide"
  | "sb.open_wellbeing_tool"
  | "sb.open_service"
  | "sb.start_free_consultation"
  | "sb.open_questionnaire_step"
  | "sb.open_dossier"
  | "sb.open_emotional_course";

export type AgentGuideTopic =
  | "anxiety"
  | "stress"
  | "insomnia"
  | "procrastination"
  | "rumination"
  | "emotional_management"
  | "emotional_eating";

export type AgentWellbeingTool =
  | "meditations"
  | "breathing"
  | "emotional_scan"
  | "gratitude_diary"
  | "weekly_goals";

export type AgentService =
  | "treatments"
  | "reprogramate"
  | "hipnodigest"
  | "method"
  | "about";

export type AgentEntryPoint =
  | "meditations"
  | "breathing"
  | "emotional_scan"
  | "questionnaire_next_step";

export type AgentNavigationPath =
  | "/ansiedad"
  | "/estres"
  | "/insomnio"
  | "/procrastinacion"
  | "/pensar-demasiado-rumiacion"
  | "/gestion-emocional"
  | "/alimentacion-emocional"
  | "/herramientas"
  | "/emotion-diary"
  | "/weekly-goals"
  | "/tratamientos-online"
  | "/reprogramate"
  | "/hipnodigest"
  | "/como-trabajamos"
  | "/quienes-somos"
  | "/session"
  | "/report"
  | "/dossier-espejo";

export type CapabilityAvailability = "available" | "unavailable";

export type CapabilityAuthRequirement =
  | "none"
  | "required"
  | "input_dependent";

export type EmotionalCourseTier = "basic" | "intermediate" | "complete";

export type EmotionalCourseSpecialty =
  | "crisis_loss_health"
  | "love_heartbreak"
  | "work_finances";

export type EmotionalCourseAccessContract =
  | {
      readonly tier: "basic";
      readonly specialtyAccess: "none";
    }
  | {
      readonly tier: "intermediate";
      readonly specialtyAccess: "one_persistent";
      readonly selectedSpecialty: EmotionalCourseSpecialty | null;
    }
  | {
      readonly tier: "complete";
      readonly specialtyAccess: "all";
    };

export interface AgentNavigationEffect {
  readonly kind: "navigate";
  readonly path: AgentNavigationPath;
  readonly entryPoint?: AgentEntryPoint;
}

export interface AgentCapabilityPlan {
  readonly riskLevel: AgentRiskLevel;
  readonly requiresAuth: boolean;
  readonly effect: AgentNavigationEffect;
}

type EmptyAgentCapabilityInput = Readonly<Record<string, never>>;

export type AgentCapabilityRequest =
  | {
      readonly capabilityId: "sb.open_guide";
      readonly input: { readonly topic: AgentGuideTopic };
    }
  | {
      readonly capabilityId: "sb.open_wellbeing_tool";
      readonly input: { readonly tool: AgentWellbeingTool };
    }
  | {
      readonly capabilityId: "sb.open_service";
      readonly input: { readonly service: AgentService };
    }
  | {
      readonly capabilityId:
        | "sb.start_free_consultation"
        | "sb.open_questionnaire_step"
        | "sb.open_dossier"
        | "sb.open_emotional_course";
      readonly input?: EmptyAgentCapabilityInput;
    };

export interface AgentCapabilityDescriptor {
  readonly id: AgentCapabilityId;
  readonly riskLevels: readonly AgentRiskLevel[];
  readonly availability: CapabilityAvailability;
  readonly authRequirement: CapabilityAuthRequirement;
  readonly futurePath?: "/emocionario";
}

export type AgentCapabilityResult =
  | {
      readonly status: "ALLOWED";
      readonly capabilityId: AgentCapabilityId;
      readonly plan: AgentCapabilityPlan;
    }
  | {
      readonly status:
        | "UNKNOWN_CAPABILITY"
        | "INVALID_INPUT"
        | "UNAVAILABLE"
        | "FORBIDDEN";
    };
