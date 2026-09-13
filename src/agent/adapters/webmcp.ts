import type { AgentArrivalStorage } from "../arrivalContext";
import { executeAgentCapabilityRequest } from "../appExecutor";
import type { AgentCapabilityId, AgentNavigationPath } from "../types";

export interface WebMcpJsonSchema {
  readonly type: "object";
  readonly properties: Readonly<Record<string, unknown>>;
  readonly required?: readonly string[];
  readonly additionalProperties: false;
}

export interface WebMcpToolAnnotations {
  readonly readOnlyHint: false;
  readonly untrustedContentHint: false;
  readonly consequentialHint: false;
}

export interface WebMcpToolExecuteOptions {
  readonly signal: AbortSignal;
}

export interface WebMcpToolDefinition {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: WebMcpJsonSchema;
  readonly annotations: WebMcpToolAnnotations;
  readonly execute: (
    input: unknown,
    options: WebMcpToolExecuteOptions,
  ) => string | Promise<string>;
}

export interface WebMcpRegistrationOptions {
  readonly signal: AbortSignal;
}

export interface WebMcpModelContext {
  registerTool(
    tool: WebMcpToolDefinition,
    options: WebMcpRegistrationOptions,
  ): void | Promise<void>;
}

export interface RegisterSoyBienestarWebMcpToolsOptions {
  readonly modelContext?: WebMcpModelContext | null;
  readonly navigate: (path: AgentNavigationPath) => void;
  readonly storage?: AgentArrivalStorage;
  readonly env?: Readonly<Record<string, unknown>>;
}

export interface SoyBienestarWebMcpRegistration {
  readonly enabled: boolean;
  readonly supported: boolean;
  readonly signal: AbortSignal;
  readonly ready: Promise<void>;
  readonly cleanup: () => void;
}

export class SoyBienestarWebMcpRegistrationError extends Error {
  constructor() {
    super("SoyBienestar WebMCP tool registration failed");
    this.name = "SoyBienestarWebMcpRegistrationError";
  }
}

const TOOL_ANNOTATIONS = {
  readOnlyHint: false,
  untrustedContentHint: false,
  consequentialHint: false,
} as const satisfies WebMcpToolAnnotations;

const GUIDE_TOPICS = [
  "anxiety",
  "stress",
  "insomnia",
  "procrastination",
  "rumination",
  "emotional_management",
  "emotional_eating",
] as const;

const WELLBEING_TOOLS = [
  "meditations",
  "breathing",
  "emotional_scan",
  "anxiety_check",
  "gratitude_diary",
  "weekly_goals",
] as const;

const SERVICES = [
  "treatments",
  "reprogramate",
  "hipnodigest",
  "method",
  "about",
] as const;

const EMPTY_INPUT_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const satisfies WebMcpJsonSchema;

function enumInputSchema(propertyName: string, values: readonly string[]): WebMcpJsonSchema {
  return {
    type: "object",
    properties: {
      [propertyName]: {
        type: "string",
        enum: values,
      },
    },
    required: [propertyName],
    additionalProperties: false,
  };
}

function executeCapability(
  capabilityId: AgentCapabilityId,
  input: unknown,
  options: WebMcpToolExecuteOptions,
  navigate: (path: AgentNavigationPath) => void,
  storage?: AgentArrivalStorage,
): string {
  if (options.signal.aborted) return "CANCELLED";

  const result = executeAgentCapabilityRequest(
    { capabilityId, input },
    {
      source: "external_webmcp",
      navigate,
      storage,
    },
  );
  return result.status;
}

function createToolDefinitions(
  navigate: (path: AgentNavigationPath) => void,
  storage?: AgentArrivalStorage,
): readonly WebMcpToolDefinition[] {
  return [
    {
      name: "soybienestar_open_guide",
      title: "Abrir guía de SoyBienestar",
      description: "Abre una guía pública de SoyBienestar sobre el tema seleccionado.",
      inputSchema: enumInputSchema("topic", GUIDE_TOPICS),
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.open_guide", input, options, navigate, storage),
    },
    {
      name: "soybienestar_open_wellbeing_tool",
      title: "Abrir herramienta de bienestar",
      description: "Orienta al usuario hacia una herramienta de bienestar de SoyBienestar, incluida la Válvula de Presión Interna para explorar señales relacionadas con ansiedad y tensión.",
      inputSchema: enumInputSchema("tool", WELLBEING_TOOLS),
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.open_wellbeing_tool", input, options, navigate, storage),
    },
    {
      name: "soybienestar_open_service",
      title: "Abrir servicio de SoyBienestar",
      description: "Abre una página pública de servicios de SoyBienestar.",
      inputSchema: enumInputSchema("service", SERVICES),
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.open_service", input, options, navigate, storage),
    },
    {
      name: "soybienestar_start_free_consultation",
      title: "Abrir consulta gratuita",
      description: "Abre el acceso a la consulta gratuita de SoyBienestar.",
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.start_free_consultation", input, options, navigate, storage),
    },
    {
      name: "soybienestar_open_questionnaire_step",
      title: "Abrir siguiente paso del cuestionario",
      description: "Abre la página que determina el siguiente paso del cuestionario.",
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.open_questionnaire_step", input, options, navigate, storage),
    },
    {
      name: "soybienestar_open_dossier",
      title: "Abrir acceso al dosier",
      description: "Abre la puerta de acceso al dosier personal de SoyBienestar.",
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: TOOL_ANNOTATIONS,
      execute: (input, options) =>
        executeCapability("sb.open_dossier", input, options, navigate, storage),
    },
  ];
}

function readBuildEnvironment(): Readonly<Record<string, unknown>> | undefined {
  return (import.meta as ImportMeta & { readonly env?: Readonly<Record<string, unknown>> }).env;
}

export function isSoyBienestarWebMcpEnabled(
  env: Readonly<Record<string, unknown>> | undefined = readBuildEnvironment(),
): boolean {
  return env?.VITE_WEBMCP_ENABLED !== "false";
}

export function getDocumentModelContext(): WebMcpModelContext | null {
  if (typeof document === "undefined") return null;
  const candidate = (document as Document & { readonly modelContext?: unknown }).modelContext;
  if (
    candidate === null ||
    typeof candidate !== "object" ||
    typeof (candidate as { readonly registerTool?: unknown }).registerTool !== "function"
  ) {
    return null;
  }
  return candidate as WebMcpModelContext;
}

export function registerSoyBienestarWebMcpTools(
  options: RegisterSoyBienestarWebMcpToolsOptions,
): SoyBienestarWebMcpRegistration {
  const controller = new AbortController();
  const enabled = isSoyBienestarWebMcpEnabled(options.env);
  const supported = typeof options.modelContext?.registerTool === "function";
  const cleanup = () => controller.abort();

  if (!enabled || !supported || !options.modelContext) {
    return {
      enabled,
      supported,
      signal: controller.signal,
      ready: Promise.resolve(),
      cleanup,
    };
  }

  const tools = createToolDefinitions(options.navigate, options.storage);
  const ready = (async () => {
    try {
      for (const tool of tools) {
        if (controller.signal.aborted) return;
        await options.modelContext.registerTool(tool, { signal: controller.signal });
      }
    } catch {
      if (controller.signal.aborted) return;
      controller.abort();
      throw new SoyBienestarWebMcpRegistrationError();
    }
  })();

  return {
    enabled,
    supported,
    signal: controller.signal,
    ready,
    cleanup,
  };
}
