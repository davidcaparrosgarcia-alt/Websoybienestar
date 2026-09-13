import { findInternalGuideAction, type InternalGuideAction } from "./internalGuide";
import type { AgentCoarseUserState } from "./userState";

export type InternalGuideProcessReason = "next_step" | "pricing";

export interface InternalGuideProcessAnswer {
  readonly message: string;
  readonly action: InternalGuideAction;
}

const PRICE_INTRO =
  "Nuestros tratamientos se organizan en programas completos pensados para ajustarse a las necesidades de cada persona. En ReprogrÁmate preferimos no reducir la decisión a una cifra aislada antes de conocer tu punto de partida: primero seguimos la consulta guiada gratuita y, cuando corresponde, el Cuestionario Espejo y el Dossier. Al finalizar tendrás la información necesaria para valorar con calma y decidir libremente si alguno de nuestros paquetes encaja contigo.";

function actionOrThrow(actionId: string): InternalGuideAction {
  const action = findInternalGuideAction(actionId);
  if (!action) throw new Error(`Missing internal guide action: ${actionId}`);
  return action;
}

function nextStepForState(state: AgentCoarseUserState | null): InternalGuideProcessAnswer {
  const actionId = state?.recommendedProcessActionId ?? "process_free_consultation";
  const action = actionOrThrow(actionId);

  if (actionId === "process_dossier") {
    return {
      message: "Por el estado disponible de tu proceso, tu siguiente paso es revisar tu Dossier Espejo. La guía solo conoce este estado general; no puede leer el contenido del dosier ni ninguna clave de acceso.",
      action,
    };
  }

  if (actionId === "process_questionnaire") {
    if (state?.questionnaireStage === "reset_required") {
      return {
        message: "Por el estado disponible de tu proceso, el Cuestionario Espejo necesita retomarse desde el paso previsto por la propia web. Puedo llevarte al punto que determina qué corresponde hacer ahora.",
        action,
      };
    }
    return {
      message: "Por el estado disponible de tu proceso, tu siguiente paso es continuar con el Cuestionario Espejo. Puedo llevarte a la página que determina exactamente dónde debes retomarlo.",
      action,
    };
  }

  return {
    message: "Si no sabes por dónde empezar, el primer paso es la consulta guiada gratuita. Dura aproximadamente 15 minutos y sirve para obtener una primera orientación y establecer tu punto de partida.",
    action,
  };
}

export function buildInternalGuideProcessAnswer(
  reason: InternalGuideProcessReason,
  state: AgentCoarseUserState | null,
): InternalGuideProcessAnswer {
  const nextStep = nextStepForState(state);
  if (reason === "next_step") return nextStep;

  return {
    message: `${PRICE_INTRO} ${
      nextStep.action.id === "process_free_consultation"
        ? "Si quieres conocer qué modalidad podría tener sentido para ti, puedes empezar por esa consulta gratuita."
        : nextStep.action.id === "process_questionnaire"
          ? "Como ya has avanzado en el proceso, lo más útil es continuar con el Cuestionario Espejo antes de valorar una modalidad."
          : "Como tu dosier ya figura disponible, revisarlo es el paso que te dará el contexto necesario antes de decidir."
    }`,
    action: nextStep.action,
  };
}
