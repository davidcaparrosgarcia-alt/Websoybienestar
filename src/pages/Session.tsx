import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";
import { auth } from "../firebase";
import { setDoc, updateDoc } from "firebase/firestore";
import { getOrMigrateUserProfile } from "../services/userProfile";
import SEO from "../components/SEO";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  errorMessage?: string;
}

const FALLBACK_RECORDING_MAX_MS = 3 * 60 * 1000;
type FallbackStopReason =
  | "manual"
  | "audio_limit"
  | "session_limit"
  | null;

export default function Session() {
  const seo = (
    <SEO title="Consulta inicial online | SoyBienestar" description="Espacio privado de consulta inicial online para ordenar tu situación emocional dentro de SoyBienestar.es." canonicalPath="/session" noIndex={true} />
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hola. Soy un guía virtual diseñado para escucharte. Estoy aquí para entender cómo te sientes y ayudarte a ordenar tu situación para que nuestro equipo humano pueda acompañarte de la mejor manera. Tenemos unos 15 minutos. ¿Cómo te gustaría empezar a contarme lo que te trae por aquí hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFallbackRecording, setIsFallbackRecording] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [fallbackStopReason, setFallbackStopReason] =
    useState<FallbackStopReason>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showHelpText, setShowHelpText] = useState(false);
  const [hasStartedGuidedSession, setHasStartedGuidedSession] = useState(false);
  const [hasUserStartedResponding, setHasUserStartedResponding] =
    useState(false);
  const [urgentMessage, setUrgentMessage] = useState<string | null>(null);
  const [sessionUserContext, setSessionUserContext] = useState<any>(null);
  const [hasExpandedAudioTranscription, setHasExpandedAudioTranscription] = useState(false);

  const startSessionTimerIfNeeded = () => {
    if (!hasUserStartedResponding) {
      sessionStartTimeRef.current = Date.now();
      setHasUserStartedResponding(true);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fallbackStreamRef = useRef<MediaStream | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingFallbackRef = useRef(false);

  const isMobileLikeDevice = () => {
    if (typeof navigator === "undefined" || typeof window === "undefined") return false;

    return (
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      window.matchMedia("(pointer: coarse)").matches
    );
  };

  const supportsMediaRecorderAudio = () => {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    );
  };

  // Custom refs for robust state handling independently of closure states
  const isRecordingRef = useRef(false);
  const restartAttemptsRef = useRef(0);
  const sessionStartTimeRef = useRef(Date.now());
  const ignoreSpeechResultsRef = useRef(false);
  const hasReceivedSpeechResultRef = useRef(false);
  const inputRef = useRef("");
  const timeLeftRef = useRef(15 * 60);
  const pendingSessionLimitAutoSendRef = useRef(false);
  const sessionLimitHandledRef = useRef(false);
  const sessionLimitMessageSentRef = useRef(false);

  const navigate = useNavigate();
  const [hasDoneConsultation, setHasDoneConsultation] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // Small delay to let Auth state settle
      await new Promise((r) => setTimeout(r, 500));
      const user = auth.currentUser;
      if (user) {
        try {
          const { userRef, profileRef } = await getOrMigrateUserProfile(
            user.uid,
          );
          const { getDoc } = await import("firebase/firestore");
          const [userDoc, profileDoc] = await Promise.all([
            getDoc(userRef),
            getDoc(profileRef),
          ]);
          if (isMounted) {
            const isTestUser = user.email === "davidcaparrosgarcia@gmail.com";
            const userData = userDoc.data() || {};
            const profileData = profileDoc.data() || {};

            setHasDoneConsultation(
              isTestUser ? false : !!userData.hasDoneConsultation,
            );

            const estadoCuestionarioEspejo = (() => {
              if (
                userData.questionnaireCompleted ||
                profileData.questionnaireCompleted
              )
                return "cuestionario_completado";
              if (userData.questionnaireSent || profileData.questionnaireSent)
                return "cuestionario_enviado";
              if (
                userData.lastQuestionnaireRequestAt ||
                profileData.lastQuestionnaireRequestAt
              )
                return "cuestionario_solicitado_confirmado";
              if (
                userData.lastQuestionnaireRequestAttemptAt ||
                profileData.lastQuestionnaireRequestAttemptAt
              )
                return "cuestionario_solicitud_intentada_no_confirmada";
              return "cuestionario_no_solicitado";
            })();

            setSessionUserContext({
              uid: user.uid,
              email: user.email || "",
              displayName:
                user.displayName ||
                userData.displayName ||
                profileData.displayName ||
                "",
              hasDoneConsultation: !!userData.hasDoneConsultation,
              personalData: {
                nombre:
                  userData.nombre ||
                  profileData.nombre ||
                  userData.name ||
                  profileData.name ||
                  "",
                edad:
                  userData.edad ||
                  profileData.edad ||
                  userData.profileAge ||
                  profileData.profileAge ||
                  "",
                sexo:
                  userData.sexo ||
                  profileData.sexo ||
                  userData.gender ||
                  profileData.gender ||
                  "",
                telefono:
                  userData.contactPhone ||
                  profileData.contactPhone ||
                  userData.phone ||
                  profileData.phone ||
                  "",
              },
              questionnaire: {
                estadoCuestionarioEspejo,
                lastQuestionnaireRequestAt:
                  userData.lastQuestionnaireRequestAt ||
                  profileData.lastQuestionnaireRequestAt ||
                  null,
                questionnaireRequestCount:
                  userData.questionnaireRequestCount ||
                  profileData.questionnaireRequestCount ||
                  0,
                preferredChannels:
                  userData.preferredChannels ||
                  profileData.preferredChannels ||
                  null,
                lastQuestionnaireContactSnapshot:
                  userData.lastQuestionnaireContactSnapshot ||
                  profileData.lastQuestionnaireContactSnapshot ||
                  null,
              },
              resources: {
                gratitudeEntriesCount:
                  userData.gratitudeEntriesCount ||
                  profileData.gratitudeEntriesCount ||
                  0,
                lastGratitudeDate:
                  userData.lastGratitudeDate ||
                  profileData.lastGratitudeDate ||
                  null,
                meditationsCompletedCount:
                  userData.meditationsCompletedCount ||
                  profileData.meditationsCompletedCount ||
                  0,
                lastMeditationId:
                  userData.lastMeditationId ||
                  profileData.lastMeditationId ||
                  null,
                breathingExercisesCount:
                  userData.breathingExercisesCount ||
                  profileData.breathingExercisesCount ||
                  0,
                weeklyGoalsCount:
                  userData.weeklyGoalsCount ||
                  profileData.weeklyGoalsCount ||
                  0,
                hasWeeklyGoalsBoard:
                  !!userData.hasWeeklyGoalsBoard ||
                  !!profileData.hasWeeklyGoalsBoard,
              },
            });

            // Saludo dinamico
            const nombreSaludo =
              userData.nombre ||
              profileData.nombre ||
              userData.name ||
              profileData.name;
            if (nombreSaludo) {
              setMessages((prev) => {
                if (prev.length === 1 && prev[0].id === "1") {
                  return [
                    {
                      id: "1",
                      role: "assistant",
                      content: `Hola, ${nombreSaludo}. Me alegra que hayas llegado hasta aquí. Este es un espacio de primera escucha: puedes contarme con calma qué te preocupa o qué te gustaría ordenar, sin necesidad de explicarlo perfecto.\n\nNo voy a juzgarte ni a ponerte etiquetas. Mi papel es ayudarte a dar forma a lo que estás viviendo para que después el equipo humano pueda acompañarte mejor.\n\nPara empezar, cuéntame solo lo más importante: ¿qué te ha traído hoy hasta aquí?`,
                    },
                  ];
                }
                return prev;
              });
            } else {
              setMessages((prev) => {
                if (prev.length === 1 && prev[0].id === "1") {
                  return [
                    {
                      id: "1",
                      role: "assistant",
                      content:
                        "Hola. Me alegra que hayas llegado hasta aquí. Este es un espacio de primera escucha: puedes contarme con calma qué te preocupa o qué te gustaría ordenar, sin necesidad de explicarlo perfecto.\n\nNo voy a juzgarte ni a ponerte etiquetas. Mi papel es ayudarte a dar forma a lo que estás viviendo para que después el equipo humano pueda acompañarte mejor.\n\nPara empezar, cuéntame solo lo más importante: ¿qué te ha traído hoy hasta aquí?",
                    },
                  ];
                }
                return prev;
              });
            }
          }
        } catch (e) {
          console.error("Auth check failed", e);
          if (isMounted) setHasDoneConsultation(false);
        }
      } else {
        if (isMounted) setHasDoneConsultation(false);
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToBottom = () => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }

      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch {}

      fallbackStreamRef.current?.getTracks().forEach((track) => track.stop());
      fallbackStreamRef.current = null;

      try {
        recognitionRef.current?.abort();
      } catch {}

      recognitionRef.current = null;
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const isSessionExpired = timeLeft <= 0;
  const isTypingPauseRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTypingPause, setIsTypingPause] = useState(false);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft > 0) {
      sessionLimitHandledRef.current = false;
      return;
    }

    if (sessionLimitHandledRef.current) return;

    const hasActiveVoiceProcess =
      isFallbackRecording ||
      isTranscribingAudio ||
      isRecordingRef.current;

    if (!hasActiveVoiceProcess) return;

    sessionLimitHandledRef.current = true;
    pendingSessionLimitAutoSendRef.current = true;

    if (isFallbackRecording) {
      void stopFallbackAudioRecording("session_limit");
      return;
    }

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);

      try {
        recognitionRef.current?.stop();
      } catch {
        try {
          recognitionRef.current?.abort();
        } catch {}
      }
    }
  }, [timeLeft, isFallbackRecording, isTranscribingAudio]);

  useEffect(() => {
    if (!hasStartedGuidedSession || !hasUserStartedResponding) return;
    const interval = setInterval(() => {
      if (isTypingPauseRef.current) {
        sessionStartTimeRef.current += 1000;
      }
      const elapsed = Math.floor(
        (Date.now() - sessionStartTimeRef.current) / 1000,
      );
      const remaining = Math.max(0, 15 * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStartedGuidedSession, hasUserStartedResponding]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";

    recognition.onresult = (event: any) => {
      if (ignoreSpeechResultsRef.current) return;
      hasReceivedSpeechResultRef.current = true;
      
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        const space =
          baseInputRef.current &&
          !baseInputRef.current.endsWith(" ") &&
          !finalTranscript.startsWith(" ")
            ? " "
            : "";
        baseInputRef.current = baseInputRef.current + space + finalTranscript;
      }

      const space2 =
        baseInputRef.current &&
        !baseInputRef.current.endsWith(" ") &&
        interimTranscript &&
        !interimTranscript.startsWith(" ")
          ? " "
          : "";
      setInput(baseInputRef.current + space2 + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      isRecordingRef.current = false;

      if (pendingSessionLimitAutoSendRef.current) {
        setRecordingError(null);
        setShowHelpText(false);
        return;
      }

      if (
        hasReceivedSpeechResultRef.current &&
        event.error !== "not-allowed" &&
        event.error !== "audio-capture"
      ) {
        setRecordingError(null);
        setShowHelpText(false);
        return;
      }

      if (event.error === "not-allowed") {
        setRecordingError(
          "Permiso de micrófono denegado. Actívalo en los ajustes del navegador.",
        );
        setShowHelpText(false);
      } else if (event.error === "audio-capture") {
        setRecordingError(
          "No se ha podido acceder al micrófono. Revisa que no esté siendo usado por otra aplicación.",
        );
        setShowHelpText(false);
      } else if (event.error === "no-speech") {
        setRecordingError(
          "No se detectó voz. Puedes intentarlo de nuevo o escribir manualmente.",
        );
        setShowHelpText(false);
      } else if (event.error === "network") {
        setRecordingError(
          "La función de voz se ha interrumpido por conexión. Puedes continuar escribiendo o volver a intentarlo.",
        );
        setShowHelpText(false);
      } else {
        setRecordingError(
          "La función de voz se ha detenido. Puedes continuar escribiendo o volver a intentarlo.",
        );
        setShowHelpText(false);
      }
      setTimeout(() => setRecordingError(null), 8000);
    };

    recognition.onend = () => {
      if (pendingSessionLimitAutoSendRef.current) {
        window.setTimeout(() => {
          const finalText = inputRef.current.trim();

          if (
            finalText &&
            !sessionLimitMessageSentRef.current
          ) {
            sessionLimitMessageSentRef.current = true;
            pendingSessionLimitAutoSendRef.current = false;

            void submitMessageText(finalText, {
              allowExpired: true,
              timeLeftOverride: 0,
            });
          }
        }, 200);

        return;
      }

      if (isRecordingRef.current) {
        // Unintended stop, try to restart once
        if (restartAttemptsRef.current < 1) {
          restartAttemptsRef.current += 1;
          try {
            recognition.start();
            return; // Don't trigger stop states
          } catch (e) {
            console.error("No se pudo reiniciar el reconocimiento", e);
          }
        }
        // If we get here, restart failed or max attempts reached
        if (hasReceivedSpeechResultRef.current) {
          setIsRecording(false);
          isRecordingRef.current = false;
          setRecordingError(null);
          setShowHelpText(false);
          return;
        }

        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingError(
          "La grabación por voz se ha detenido. Puedes volver a intentarlo o escribir manualmente.",
        );
        setShowHelpText(false);
        setTimeout(() => setRecordingError(null), 8000);
      } else {
        // Intended normal manual stop
        setIsRecording(false);
      }
    };

    return recognition;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    startSessionTimerIfNeeded();
    setInput(e.target.value);

    if (!isRecordingRef.current) {
      isTypingPauseRef.current = true;
      setIsTypingPause(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingPauseRef.current = false;
        setIsTypingPause(false);
      }, 5000);
    }
  };

  const submitMessageText = async (
    rawText: string,
    options?: {
      allowExpired?: boolean;
      timeLeftOverride?: number;
    },
  ) => {
    const submittedText = rawText.trim();
    if (!submittedText || isLoading) return;

    if (!options?.allowExpired && isSessionExpired) return;

    if (Date.now() - sessionStartTimeRef.current > 15 * 60 * 1000 && !options?.allowExpired) {
      alert("La consulta ha llegado a su límite de 15 minutos.");
      return;
    }

    isTypingPauseRef.current = false;
    setIsTypingPause(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const isTest = auth.currentUser?.email === "davidcaparrosgarcia@gmail.com";

    const maxChars = isTest ? 8000 : 4000;
    if (submittedText.length > maxChars) {
      alert(
        `Por favor, acorta tu mensaje. El máximo permitido es de ${maxChars} caracteres.`,
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: submittedText,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!isRecordingRef.current) {
      setInput("");
      baseInputRef.current = "";
      inputRef.current = "";
    }
    setHasExpandedAudioTranscription(false);
    setIsLoading(true);

    await processMessage(newMessages, submittedText, userMessage.id, options?.timeLeftOverride);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSessionExpired || isRecording || isFallbackRecording || isTranscribingAudio) return;

    await submitMessageText(input);
  };

  const processMessage = async (
    currentMessages: Message[],
    inputContent: string,
    messageId: string,
    timeLeftOverride?: number,
  ) => {
    setIsLoading(true);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, isError: false, errorMessage: undefined }
          : m,
      ),
    );

    try {
      const chatHistory = currentMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const effectiveTimeLeft =
        typeof timeLeftOverride === "number"
          ? timeLeftOverride
          : timeLeft;

      const getSessionPhase = () => {
        if (effectiveTimeLeft > 10 * 60) return "inicio";
        if (effectiveTimeLeft > 4 * 60) return "desarrollo";
        return "cierre";
      };

      const buildSessionContextForAI = () => ({
        time: {
          timeLeftSeconds: effectiveTimeLeft,
          elapsedSeconds: 15 * 60 - effectiveTimeLeft,
          sessionPhase:
            effectiveTimeLeft <= 0
              ? "cierre"
              : getSessionPhase(),
          hasTimerStarted: hasStartedGuidedSession,
        },
        user: sessionUserContext || null,
      });

      const response = await api.sessionReply(
        chatHistory.slice(0, -1),
        inputContent,
        buildSessionContextForAI(),
      );

      if (response.text) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.text,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

      if (response.action === "send_questionnaire" && response.actionParams) {
        const {
          preferredChannels,
          telefono,
          edad,
          sexo,
          nombre,
          consentConfirmed,
        } = response.actionParams;
        if (consentConfirmed) {
          try {
            const user = auth.currentUser;
            if (user) {
              const token = await user.getIdToken();
              const payload = {
                email: user.email || "",
                telefono,
                edad,
                sexo,
                nombre,
                preferredChannels,
              };

              const res = await fetch("/api/request-questionnaire", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              if (res.ok) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    role: "assistant",
                    content:
                      "*(Sistema: Solicitud registrada correctamente. El enlace te llegará pronto según tus preferencias.)*",
                  },
                ]);
              } else {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    role: "assistant",
                    content:
                      "*(Sistema: Ha ocurrido un fallo al registrar la solicitud automáticamente. Por favor, usa el formulario manual en la sección Próximos Pasos tras finalizar la sesión.)*",
                  },
                ]);
              }
            }
          } catch (e) {
            console.error("Failed to trigger questionnaire action", e);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content:
                  "*(Sistema: No se pudo registrar la solicitud. Por favor, realiza la solicitud en la sección Próximos Pasos al finalizar.)*",
              },
            ]);
          }
        }
      }
    } catch (error: any) {
      console.error("Error calling AI:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                isError: true,
                errorMessage:
                  error.message ||
                  "Lo siento, ha ocurrido un error de conexión.",
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startFallbackAudioRecording = async () => {
    if (!supportsMediaRecorderAudio()) {
      setRecordingError(
        "No hemos podido iniciar la grabación de voz en este navegador. Puedes escribir manualmente o revisar los permisos del micrófono.",
      );
      setShowHelpText(false);
      setTimeout(() => setRecordingError(null), 8000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      fallbackStreamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          mimeType = "audio/aac";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;

      setIsFallbackRecording(true);
      setFallbackStopReason(null);
      setRecordingError(null);
      setShowHelpText(false);
      startSessionTimerIfNeeded();

      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = setTimeout(() => {
        const stopReason =
          timeLeftRef.current <= 0
            ? "session_limit"
            : "audio_limit";
        void stopFallbackAudioRecording(stopReason);
      }, FALLBACK_RECORDING_MAX_MS);
    } catch (e: any) {
      console.error("Could not start fallback microphone", e);
      if (fallbackStreamRef.current) {
        fallbackStreamRef.current.getTracks().forEach((track) => track.stop());
        fallbackStreamRef.current = null;
      }
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsFallbackRecording(false);
      setRecordingError(
        "No hemos podido iniciar la grabación de voz en este navegador. Puedes escribir manualmente o revisar los permisos del micrófono.",
      );
      setShowHelpText(false);
      setTimeout(() => setRecordingError(null), 8000);
    }
  };

  const stopFallbackAudioRecording = async (
    reason: Exclude<FallbackStopReason, null> = "manual",
  ) => {
    if (isStoppingFallbackRef.current) return;
    isStoppingFallbackRef.current = true;
    setFallbackStopReason(reason);

    try {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }

      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsFallbackRecording(false);
        if (fallbackStreamRef.current) {
          fallbackStreamRef.current.getTracks().forEach((track) => track.stop());
          fallbackStreamRef.current = null;
        }
        return;
      }

      setIsFallbackRecording(false);
      setIsTranscribingAudio(true);

      const mimeType = recorder.mimeType || "audio/webm";

      const stopPromise = new Promise<Blob>((resolve) => {
        let resolved = false;
        const done = () => {
          if (!resolved) {
            resolved = true;
            resolve(new Blob(audioChunksRef.current, { type: mimeType }));
          }
        };
        recorder.onstop = done;
        setTimeout(done, 1000);
      });

      try {
        recorder.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder", e);
      }

      if (fallbackStreamRef.current) {
        fallbackStreamRef.current.getTracks().forEach((track) => track.stop());
        fallbackStreamRef.current = null;
      }

      try {
        const blob = await stopPromise;
        if (blob.size === 0) {
          setIsTranscribingAudio(false);
          return;
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1] || "";
            resolve(base64Data);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(blob);

        const base64Data = await base64Promise;
        const res = await api.transcribeAudio(base64Data, mimeType);

        if (res && res.text) {
          const transcribed = res.text.trim();
          if (transcribed) {
            const previousText = inputRef.current.trim();
            const finalText = previousText
              ? `${previousText} ${transcribed}`
              : transcribed;

            inputRef.current = finalText;
            setInput(finalText);
            setHasExpandedAudioTranscription(true);

            const mustAutoSendBecauseSessionEnded =
              reason === "session_limit" ||
              pendingSessionLimitAutoSendRef.current;

            if (
              mustAutoSendBecauseSessionEnded &&
              !sessionLimitMessageSentRef.current
            ) {
              sessionLimitMessageSentRef.current = true;
              pendingSessionLimitAutoSendRef.current = false;

              await submitMessageText(finalText, {
                allowExpired: true,
                timeLeftOverride: 0,
              });
            }
          }
        }
      } catch (err: any) {
        console.error("Audio transcription error", err);
        setRecordingError(
          "Se ha podido grabar el audio, pero no transcribirlo. Puedes intentarlo de nuevo o escribir manualmente.",
        );
        setTimeout(() => setRecordingError(null), 8000);
      } finally {
        setIsTranscribingAudio(false);
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        setFallbackStopReason(null);
      }
    } finally {
      isStoppingFallbackRef.current = false;
    }
  };

  const toggleRecording = async () => {
    if (isSessionExpired || isTranscribingAudio) return;

    if (isFallbackRecording) {
      await stopFallbackAudioRecording("manual");
      return;
    }

    if (isRecordingRef.current) {
      // Manual stop
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {}
      return;
    }

    if (isMobileLikeDevice()) {
      await startFallbackAudioRecording();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      let permissionStream: MediaStream | null = null;
      try {
        permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e: any) {
        console.error("Could not start microphone", e);
        setRecordingError(
          "Permiso de micrófono denegado. Actívalo en los ajustes del navegador.",
        );
        setShowHelpText(false);
        setTimeout(() => setRecordingError(null), 8000);
        return;
      } finally {
        if (permissionStream) {
          permissionStream.getTracks().forEach((track) => track.stop());
        }
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      recognitionRef.current = initSpeechRecognition();

      if (recognitionRef.current) {
        ignoreSpeechResultsRef.current = false;
        baseInputRef.current = input.trim() ? input.trim() : "";
        restartAttemptsRef.current = 0;
        hasReceivedSpeechResultRef.current = false;
        try {
          startSessionTimerIfNeeded();
          recognitionRef.current.start();
          isRecordingRef.current = true;
          setIsRecording(true);
          setRecordingError(null);
          setShowHelpText(false);
          return;
        } catch (err) {
          console.error("SpeechRecognition start error, using MediaRecorder fallback:", err);
        }
      }
    }

    await startFallbackAudioRecording();
  };

  const [isFinishing, setIsFinishing] = useState(false);
  const [finishingError, setFinishingError] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<any>(null);

  const finishSession = async () => {
    if (messages.length <= 1) {
      setFinishingError(
        "No hay suficiente información. Por favor comunícate más con el guía antes de finalizar.",
      );
      setTimeout(() => setFinishingError(null), 8000);
      return;
    }

    setIsFinishing(true);
    setFinishingError(null);
    setUrgentMessage(null);

    const user = auth.currentUser;
    let accumulatedSummary = "";
    let profileReference: any = null;
    let userReference: any = null;

    if (user) {
      try {
        const { userRef, profileRef, profileData } =
          await getOrMigrateUserProfile(user.uid);
        userReference = userRef;
        profileReference = profileRef;
        accumulatedSummary = profileData.globalUserSummary || "";
      } catch (e) {
        console.error("Firebase read error", e);
      }
    }

    try {
      const parsedData = await api.report(messages, accumulatedSummary);

      const isDeveloper = user?.email === "davidcaparrosgarcia@gmail.com";

      if (parsedData && (parsedData.validConclusion || isDeveloper)) {
        if (user && profileReference && userReference) {
          const updateDataUser = {
            hasDoneConsultation: true,
            lastUpdated: new Date().toISOString(),
            latestVisibleOrientationReport:
              parsedData.visibleOrientationReport || null,
            latestInternalTherapistReport:
              parsedData.internalTherapistReport || null,
          };

          const updateDataProfile = {
            globalUserSummary:
              parsedData.newAccumulatedSummary || accumulatedSummary,
            consultationConclusion:
              parsedData.clinicalSummary ||
              "Resumen clínico generado (bypass de desarrollo)",
            latestUserEmpatheticMessage:
              parsedData.userEmpatheticMessage || "Mensaje para el usuario",
            latestClinicalConclusion: parsedData.clinicalSummary || "",
            latestVisibleOrientationReport:
              parsedData.visibleOrientationReport || null,
            latestInternalTherapistReport:
              parsedData.internalTherapistReport || null,
          };

          await updateDoc(userReference, updateDataUser).catch(async () => {
            await setDoc(userReference, updateDataUser, { merge: true });
          });

          await updateDoc(profileReference, updateDataProfile).catch(
            async () => {
              await setDoc(profileReference, updateDataProfile, {
                merge: true,
              });
            },
          );
        }

        if (parsedData.needsUrgentSupport && parsedData.urgentSupportMessage) {
          setUrgentMessage(parsedData.urgentSupportMessage);
          setPendingNavigation({
            path: "/session-ended",
            state: { messages, reportData: parsedData },
          });
        } else {
          navigate("/session-ended", {
            state: { messages, reportData: parsedData },
          });
        }
      } else {
        if (parsedData.needsUrgentSupport && parsedData.urgentSupportMessage) {
          setUrgentMessage(parsedData.urgentSupportMessage);
        } else {
          setFinishingError(
            "La IA ha determinado que la sesión no tiene suficiente información o no ha llegado a una evaluación completa. Por favor, expande más tus respuestas.",
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setFinishingError(
        err.message ||
          "Ocurrió un error al evaluar la sesión. Por favor, intenta de nuevo.",
      );
    } finally {
      setIsFinishing(false);
    }
  };

  if (hasDoneConsultation === null) {
    return (
      <>
        {seo}
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-5.5rem)]">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">
            progress_activity
          </span>
        </div>
      </>
    );
  }

  if (hasDoneConsultation) {
    return (
      <>
        {seo}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface">
          <div className="max-w-md w-full bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/20 shadow-xl text-center flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">
              fact_check
            </span>
          </div>
          <h2 className="font-headline text-3xl text-primary leading-tight">
            Consulta Gratuita Completada
          </h2>
          <p className="text-on-surface-variant font-light text-lg">
            Tu próximo paso es solicitar el{" "}
            <strong className="text-primary font-medium">
              Cuestionario Espejo
            </strong>
            . ¿Deseas solicitarlo ahora?
          </p>
          <div className="w-full flex flex-col gap-4 mt-4">
            <button
              onClick={() => navigate("/method-details")}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-headline text-lg tracking-wide hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md active:scale-95"
            >
              Solicitar Cuestionario Espejo
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-surface-container-lowest text-primary border border-outline-variant/30 py-4 rounded-full font-headline hover:bg-surface-container-low transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (!hasDoneConsultation && !hasStartedGuidedSession) {
    return (
      <>
        {seo}
        <div
          className="flex-1 flex flex-col items-center justify-center p-8 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: 'url("/images/consulta_gratuita.jpg")' }}
        >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
        <div className="relative z-10 max-w-xl w-full bg-surface-container-low p-10 rounded-[2rem] border border-outline-variant/20 shadow-xl text-center flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              self_improvement
            </span>
          </div>
          <h2 className="font-headline text-3xl md:text-3xl text-primary leading-tight">
            Consulta Guiada
          </h2>
          <p className="text-on-surface-variant font-body font-light text-lg leading-relaxed text-center">
            Quiero comenzar esta primera consulta guiada, sabiendo que me
            ayudará a ordenar lo que siento y expresar mi situación con más
            claridad antes del acompañamiento de un equipo humano.
          </p>
          <div className="w-full flex justify-center mt-8">
            <button
              onClick={() => {
                sessionStartTimeRef.current = Date.now();
                setHasStartedGuidedSession(true);
              }}
              className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline text-lg tracking-wide hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Comenzar consulta guiada
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {seo}
    <div className="flex-1 flex flex-col max-h-[calc(100vh-5.5rem)] relative">
      {urgentMessage && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-8 max-w-lg rounded-[2rem] shadow-2xl flex flex-col gap-6 items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                support_agent
              </span>
            </div>
            <p className="text-on-surface font-body font-light text-lg leading-relaxed">
              {urgentMessage}
            </p>
            <button
              onClick={() => {
                setUrgentMessage(null);
                if (pendingNavigation) {
                  navigate(pendingNavigation.path, {
                    state: pendingNavigation.state,
                  });
                }
              }}
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-headline text-lg tracking-wide hover:opacity-90 transition-all active:scale-95 mt-2"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {/* Header Info */}
      <div className="border-b border-outline-variant/10 py-4 px-8 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">
            psychology
          </span>
          <div>
            <h2 className="font-headline text-primary font-medium">
              Sesión de Claridad
            </h2>
            <p className="font-body text-xs text-on-surface-variant font-light">
              Máx. 15 minutos
            </p>
          </div>
        </div>
        <button
          onClick={finishSession}
          disabled={isFinishing}
          className="font-label text-sm uppercase tracking-widest bg-primary text-on-primary transition-opacity hover:opacity-90 flex items-center gap-2 px-6 py-2 rounded-full shadow-sm disabled:opacity-50"
        >
          {isFinishing ? (
            <>
              Evaluando{" "}
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
            </>
          ) : (
            <>
              Finalizar Sesión{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </div>

      {finishingError && (
        <div className="bg-error/10 text-error p-3 text-center text-sm font-label flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>{finishingError}</span>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto relative p-4 md:p-8 bg-[#64748b]/90 backdrop-blur-sm border-y border-outline-variant/10">
        {/* Fractal Noise Texture Overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-5 mix-blend-multiply dark:mix-blend-overlay">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <filter id="chat-texture">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.005"
                numOctaves="3"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 1 0 0 0 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#chat-texture)" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "flex-col items-end" : "justify-start"} w-full`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] px-8 py-6 shadow-md border border-gray-800 dark:border-gray-200 ${
                  msg.role === "user"
                    ? "bg-primary text-on-primary rounded-br-sm shadow-black/30 dark:shadow-black/50"
                    : "bg-surface-container-low text-on-surface rounded-bl-sm shadow-black/30 dark:shadow-black/50"
                } ${msg.isError ? "opacity-75" : ""}`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-stone max-w-none font-body font-light leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap font-body font-light leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>
              {msg.isError && (
                <div className="mt-2 text-error text-xs flex flex-col items-end mr-4">
                  <span className="mb-1">{msg.errorMessage}</span>
                  <button
                    onClick={() =>
                      processMessage(
                        messages.slice(0, idx + 1),
                        msg.content,
                        msg.id,
                      )
                    }
                    disabled={isLoading}
                    className="flex items-center gap-1 bg-error/10 text-error px-3 py-1.5 rounded-full hover:bg-error/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      refresh
                    </span>
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low text-on-surface rounded-[2rem] rounded-bl-sm border border-gray-800 dark:border-gray-200 px-8 py-6 shadow-md shadow-black/30 dark:shadow-black/50 flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-secondary">
                  progress_activity
                </span>
                <span className="font-body text-on-surface-variant text-sm font-light italic">
                  Escribiendo...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-outline-variant/10 p-4 md:p-6 bg-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Error and Help Messages */}
          {(recordingError || showHelpText) && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2">
              {recordingError && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label flex items-start gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-error text-lg mt-[1px]">
                    error
                  </span>
                  <span className="leading-snug">{recordingError}</span>
                </div>
              )}
              {showHelpText && (
                <div className="p-3 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-body flex items-start gap-2 shadow-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-base mt-[1px]">
                    lightbulb
                  </span>
                  <span className="leading-relaxed">
                    Recomendación: prueba con Chrome actualizado en Android. Si
                    estás en iPhone o iPad, el soporte puede ser limitado.
                  </span>
                </div>
              )}
            </div>
          )}
          
          {isSessionExpired && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 p-3 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-body text-center shadow-sm border border-outline-variant/20">
              La sesión ha llegado al límite de 15 minutos. Puedes finalizarla para ver tu primera lectura.
            </div>
          )}

          {isSessionExpired ? (
            <>
              {/* Botón para móvil/tablet cuando la sesión expira */}
              <div className="block lg:hidden">
                <button
                  type="button"
                  onClick={finishSession}
                  disabled={isFinishing}
                  className="w-full font-label text-sm uppercase tracking-widest bg-primary text-on-primary transition-opacity hover:opacity-90 flex items-center justify-center gap-2 py-4 px-6 rounded-full shadow-md disabled:opacity-50"
                >
                  {isFinishing ? (
                    <>
                      Evaluando{" "}
                      <span className="material-symbols-outlined animate-spin text-sm">
                        progress_activity
                      </span>
                    </>
                  ) : (
                    <>
                      Finalizar Sesión{" "}
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Formulario deshabilitado para escritorio */}
              <form
                onSubmit={handleSubmit}
                className="hidden lg:flex items-center gap-3 md:gap-4"
              >
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={timeLeft <= 0 || isTranscribingAudio}
                  aria-label={
                    isTranscribingAudio
                      ? "Transcribiendo audio"
                      : isRecording || isFallbackRecording
                      ? "Detener grabación"
                      : "Iniciar grabación de voz"
                  }
                  title={
                    isTranscribingAudio
                      ? "Transcribiendo audio"
                      : isRecording || isFallbackRecording
                      ? "Detener y transcribir"
                      : "Hablar en lugar de escribir"
                  }
                  className={`h-16 w-16 p-0 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 border border-gray-800 dark:border-gray-200 aspect-square ${
                    isRecording || isFallbackRecording
                      ? "bg-error/10 text-error hover:bg-error/20"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isTranscribingAudio ? "animate-spin" : ""
                    }`}
                  >
                    {isTranscribingAudio
                      ? "progress_activity"
                      : isRecording || isFallbackRecording
                      ? "stop"
                      : "mic"}
                  </span>
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onFocus={startSessionTimerIfNeeded}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (timeLeft > 0) handleSubmit(e);
                      }
                    }}
                    disabled={timeLeft <= 0}
                    placeholder={
                      isTranscribingAudio
                        ? "Transcribiendo tu audio…"
                        : timeLeft <= 0
                        ? "Tiempo finalizado"
                        : isFallbackRecording
                        ? "Pulsa detener para convertir tu grabación en texto."
                        : "Escribe tu mensaje aquí..."
                    }
                    className={`w-full bg-surface-container-low border border-gray-800 dark:border-gray-200 focus:ring-1 focus:ring-gray-500 focus:bg-surface-container rounded-[2rem] px-6 md:px-8 py-2.5 resize-none overflow-y-auto leading-5 transition-all font-body font-light text-on-surface disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasExpandedAudioTranscription
                        ? "h-48 min-h-48 max-h-48 lg:h-16 lg:min-h-16 lg:max-h-16"
                        : "h-16 min-h-16 max-h-16"
                    }`}
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    !input.trim() ||
                    isLoading ||
                    timeLeft <= 0 ||
                    isRecording ||
                    isFallbackRecording ||
                    isTranscribingAudio
                  }
                  className="h-16 w-16 p-0 flex items-center justify-center bg-primary text-on-primary rounded-full flex-shrink-0 hover:bg-primary-container transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-800 dark:border-gray-200 aspect-square"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
                <button
                  type="button"
                  onClick={finishSession}
                  disabled={isFinishing}
                  title="Finalizar consulta ahora"
                  className="h-16 w-16 p-0 hidden md:flex items-center justify-center bg-transparent text-primary hover:bg-primary/5 rounded-full flex-shrink-0 transition-all duration-300 shadow-sm border border-primary/20 aspect-square disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined ${isFinishing ? "animate-spin" : ""}`}
                  >
                    {isFinishing ? "progress_activity" : "logout"}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 md:gap-4"
            >
              <button
                type="button"
                onClick={toggleRecording}
                disabled={timeLeft <= 0 || isTranscribingAudio}
                aria-label={
                  isTranscribingAudio
                    ? "Transcribiendo audio"
                    : isRecording || isFallbackRecording
                    ? "Detener grabación"
                    : "Iniciar grabación de voz"
                }
                title={
                  isTranscribingAudio
                    ? "Transcribiendo audio"
                    : isRecording || isFallbackRecording
                    ? "Detener y transcribir"
                    : "Hablar en lugar de escribir"
                }
                className={`h-16 w-16 p-0 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 border border-gray-800 dark:border-gray-200 aspect-square ${
                  isRecording || isFallbackRecording
                    ? "bg-error/10 text-error hover:bg-error/20"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span
                  className={`material-symbols-outlined ${
                    isTranscribingAudio ? "animate-spin" : ""
                  }`}
                >
                  {isTranscribingAudio
                    ? "progress_activity"
                    : isRecording || isFallbackRecording
                    ? "stop"
                    : "mic"}
                </span>
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onFocus={startSessionTimerIfNeeded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (timeLeft > 0) handleSubmit(e);
                    }
                  }}
                  disabled={timeLeft <= 0}
                  placeholder={
                    isTranscribingAudio
                      ? "Transcribiendo tu audio…"
                      : timeLeft <= 0
                      ? "Tiempo finalizado"
                      : isFallbackRecording
                      ? "Pulsa detener para convertir tu grabación en texto."
                      : "Escribe tu mensaje aquí..."
                  }
                  className={`w-full bg-surface-container-low border border-gray-800 dark:border-gray-200 focus:ring-1 focus:ring-gray-500 focus:bg-surface-container rounded-[2rem] px-6 md:px-8 py-2.5 resize-none overflow-y-auto leading-5 transition-all font-body font-light text-on-surface disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasExpandedAudioTranscription
                      ? "h-48 min-h-48 max-h-48 lg:h-16 lg:min-h-16 lg:max-h-16"
                      : "h-16 min-h-16 max-h-16"
                  }`}
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  isLoading ||
                  timeLeft <= 0 ||
                  isRecording ||
                  isFallbackRecording ||
                  isTranscribingAudio
                }
                className="h-16 w-16 p-0 flex items-center justify-center bg-primary text-on-primary rounded-full flex-shrink-0 hover:bg-primary-container transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-800 dark:border-gray-200 aspect-square"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
              <button
                type="button"
                onClick={finishSession}
                disabled={isFinishing}
                title="Finalizar consulta ahora"
                className="h-16 w-16 p-0 hidden md:flex items-center justify-center bg-transparent text-primary hover:bg-primary/5 rounded-full flex-shrink-0 transition-all duration-300 shadow-sm border border-primary/20 aspect-square disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined ${isFinishing ? "animate-spin" : ""}`}
                >
                  {isFinishing ? "progress_activity" : "logout"}
                </span>
              </button>
            </form>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 md:hidden">
            <div className="min-h-7 flex min-w-0 items-center">
              {isFallbackRecording && (
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-error"
                  role="status"
                  aria-live="polite"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    mic
                  </span>
                  <span className="whitespace-nowrap font-label text-[11px] font-bold">
                    Grabando tu voz
                  </span>
                </div>
              )}

              {!isFallbackRecording &&
                isTranscribingAudio &&
                fallbackStopReason === "audio_limit" && (
                  <div
                    className="inline-flex items-center gap-2 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-error"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      timer_off
                    </span>
                    <span className="whitespace-nowrap font-label text-[11px] font-bold">
                      Límite de audio alcanzado
                    </span>
                  </div>
                )}

              {!isFallbackRecording &&
                isTranscribingAudio &&
                fallbackStopReason === "session_limit" && (
                  <div
                    className="inline-flex items-center gap-2 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-error"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      timer_off
                    </span>
                    <span className="whitespace-nowrap font-label text-[11px] font-bold">
                      Tiempo de consulta finalizado
                    </span>
                  </div>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-outline-variant/10 bg-surface-container px-3 py-1 font-label text-xs text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-[14px]">
                timer
              </span>
              <span>Tiempo restante: {formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="mt-4 hidden md:flex justify-between items-center text-xs font-label">
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-on-surface-variant shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-[14px]">
                timer
              </span>
              <span>Tiempo restante: {formatTime(timeLeft)}</span>
              {isTypingPause && (
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full animate-pulse ml-1 opacity-80">
                  (pausado)
                </span>
              )}
            </div>
            <p className="text-on-surface-variant/70 italic hidden sm:block">
              {timeLeft <= 180
                ? "La sesión terminará pronto. Ve cerrando tus ideas."
                : "Tómate tu tiempo para expresar lo que sientes."}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
