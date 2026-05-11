import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import Markdown from "react-markdown";
import { api } from "../services/api";
import { getOrMigrateUserProfile } from "../services/userProfile";
import NextStepsModal from "../components/NextStepsModal";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const messages = location.state?.messages || [];
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showDossierText, setShowDossierText] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const reportData = location.state?.reportData || null;

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [profileDataState, setProfileDataState] = useState<any>(null);

  // States for NextStepsModal
  const [isNextStepsModalOpen, setIsNextStepsModalOpen] = useState(false);
  const emailValue = user?.email || "";
  let phoneValue = "+34";
  if (userData) {
    const contactPhone =
      userData.contactPhone ||
      userData.phone ||
      userData.whatsappPhone ||
      userData.smsPhone ||
      userData.telefono;
    if (contactPhone) {
      const prefix = userData.contactPhoneCountryCode || "+34";
      phoneValue = contactPhone.startsWith("+")
        ? contactPhone
        : `${prefix}${contactPhone}`;
    }
  }

  useEffect(() => {
    let isMounted = true;
    const loadReportData = async () => {
      // First check authorization
      const isDeveloper = user?.email === "davidcaparrosgarcia@gmail.com";
      let authState = false;

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            if (isMounted) setUserData(userDoc.data());
            if (userDoc.data()?.hasDoneConsultation) {
              authState = true;
            }
          }
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }

      if (isDeveloper) {
        authState = true;
      }

      if (!isMounted) return;
      setIsAuthorized(authState);

      if (!authState && !isDeveloper && !reportData) {
        setReport("No hay informe disponible o no tienes acceso.");
        setIsLoading(false);
        return;
      }

      // Load Report
      try {
        if (reportData) {
          // Passed from SessionEnded -> Session
          if (reportData.visibleOrientationReport) {
            setReport(reportData.visibleOrientationReport);
          } else if (reportData.userEmpatheticMessage) {
            setReport(reportData.userEmpatheticMessage);
          } else {
            setReport(reportData);
          }
        } else if (user) {
          // Try loading from Firebase
          const { profileData } = await getOrMigrateUserProfile(user.uid);
          const profile = profileData as any;
          setProfileDataState(profileData || null);

          if (profile.reportFeedback) {
            setReportFeedback({
              agrees: profile.reportFeedback.agrees,
              label: profile.reportFeedback.label,
            });
            setFeedbackGiven(true);
          } else if (profile.latestReportFeedbackLabel) {
            setReportFeedback({
              agrees: profile.latestReportFeedbackAgrees,
              label: profile.latestReportFeedbackLabel,
            });
            setFeedbackGiven(true);
          }

          if (profile.latestVisibleOrientationReport) {
            setReport(profile.latestVisibleOrientationReport);
          } else if (profile.latestUserEmpatheticMessage) {
            setReport(profile.latestUserEmpatheticMessage);
          } else if (profile.latestClinicalConclusion) {
            setReport(profile.latestClinicalConclusion);
          } else {
            if (isDeveloper) {
              setReport(
                "No hay informe guardado, pero eres desarrollador. Intenta hacer una sesión primero.",
              );
            } else {
              setReport("No encontramos un informe guardado para tu cuenta.");
            }
          }
        } else {
          setReport("No hay informe disponible.");
        }
      } catch (err) {
        console.error("Error loading report:", err);
        if (isMounted)
          setError("Ocurrió un error al cargar su informe clínico.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user !== undefined) {
      loadReportData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, reportData]);

  useEffect(() => {
    if (location.hash === "#next-steps") {
      setTimeout(() => {
        const el = document.getElementById("next-steps");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500); // Wait for loading to finish and rendering
    }
  }, [location.hash, isLoading, isAuthorized]);

  const handleShare = async () => {
    const shareData = {
      title: "ReprogrÁmate - Sesión Gratuita",
      text: "Te recomiendo probar esta web. Ofrece una sesión gratuita de 15 minutos con un asistente inicial, con una orientación gratuita y máxima privacidad.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " ¡Pruébalo aquí: " + shareData.url)}`;
        window.open(whatsappUrl, "_blank");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [reportFeedback, setReportFeedback] = useState<{
    agrees: boolean;
    label: "totalmente" | "no_del_todo";
  } | null>(null);

  const handleFeedback = async (agrees: boolean, comment?: string) => {
    const label = agrees ? "totalmente" : "no_del_todo";
    setReportFeedback({ agrees, label } as any);
    setFeedbackGiven(true);

    if (!user) return;

    try {
      const feedbackPayload = {
        reportFeedback: {
          agrees,
          label,
          comment: comment || "",
          reportExcerpt: (typeof report === "string"
            ? report
            : JSON.stringify(report)
          ).slice(0, 1200),
          reportFeedbackAt: serverTimestamp(),
        },
        latestReportFeedbackAgrees: agrees,
        latestReportFeedbackLabel: label,
        latestReportFeedbackComment: comment || "",
        latestReportFeedbackAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), feedbackPayload, {
        merge: true,
      });
      await setDoc(doc(db, "userProfiles", user.uid), feedbackPayload, {
        merge: true,
      });
    } catch (error) {
      console.error("Error saving report feedback:", error);
    }
  };

  const handleClearTesterReport = async () => {
    if (user?.email !== "davidcaparrosgarcia@gmail.com") return;
    const confirmed = window.confirm(
      "Esto limpiará solo el informe y feedback de prueba para repetir la consulta. ¿Continuar?",
    );
    if (!confirmed) return;

    const cleanupPayload = {
      latestVisibleOrientationReport: deleteField(),
      latestInternalTherapistReport: deleteField(),
      latestUserEmpatheticMessage: deleteField(),
      latestClinicalConclusion: deleteField(),
      latestReportFeedbackComment: deleteField(),
      globalUserSummary: deleteField(),
      latestReportFeedbackAgrees: deleteField(),
      latestReportFeedbackLabel: deleteField(),
      latestReportFeedbackAt: deleteField(),
      reportFeedback: deleteField(),
      hasDoneConsultation: false,
      lastQuestionnaireRequestAt: deleteField(),
      lastQuestionnaireContactSnapshot: deleteField(),
      questionnaireRequestCount: deleteField(),
      latestQuestionnaireRequest: deleteField(),
      questionnairePersonalDataUpdatedAt: deleteField(),
    };

    await updateDoc(doc(db, "users", user.uid), cleanupPayload).catch(() => {});
    await updateDoc(doc(db, "userProfiles", user.uid), cleanupPayload).catch(
      () => {},
    );

    setUserData((prev: any) => ({ ...prev, hasDoneConsultation: false }));
    navigate("/session");
  };

  const mergedUserState = {
    ...(profileDataState || {}),
    ...(userData || {}),
  };

  const hasConsultation =
    !!mergedUserState?.hasDoneConsultation || !!reportData;
  const questionnaireRequested =
    !!mergedUserState?.lastQuestionnaireRequestAt ||
    !!mergedUserState?.latestQuestionnaireRequest;
  const questionnaireCompleted =
    !!mergedUserState?.hasDoneCuestionario ||
    mergedUserState?.questionnaireStatus === "completed" ||
    mergedUserState?.questionnaireStatus === "concluded" ||
    mergedUserState?.questionnaireStatus === "finalized";
  const dossierAvailable =
    !!mergedUserState?.dossierAvailableAt || !!mergedUserState?.latestDossier;
  const dossierViewed = !!mergedUserState?.dossierViewedAt;

  let activeNextStep = "consulta";
  if (!hasConsultation) activeNextStep = "consulta";
  else if (hasConsultation && !questionnaireCompleted)
    activeNextStep = "cuestionario";
  else if (questionnaireCompleted && !dossierAvailable)
    activeNextStep = "dossier";
  else if (dossierAvailable && !dossierViewed) activeNextStep = "dossier";
  else if (dossierViewed) activeNextStep = "validacion";

  if (isAuthorized === null || isLoading) {
    return (
      <div className="flex-1 w-full bg-transparent flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-secondary text-4xl">
            progress_activity
          </span>
          <p className="font-label text-on-surface-variant">
            Cargando su informe...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex-1 w-full bg-transparent p-8 flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 text-center space-y-6">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="font-headline text-2xl text-primary">
            Acceso Restringido
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Esta página solo está disponible tras completar con éxito y validar
            la Consulta Gratuita.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-label flex items-center justify-center gap-2 hover:bg-secondary transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent w-full">
      {/* POST-ACCESS CONTENT: BENTO GRID SUMMARY */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-16 border-l-4 border-secondary pl-8">
          <h2 className="text-5xl font-headline font-bold text-primary mb-4">
            Tu informe de bienestar
          </h2>
          <p className="text-xl text-on-surface-variant max-w-2xl">
            Esta primera lectura recoge lo que has compartido en la consulta y
            te ayuda a ordenar tu momento actual antes del Cuestionario Espejo.
          </p>
        </div>

        {error ? (
          <div className="bg-error-container text-on-error-container p-8 rounded-xl border border-error/20">
            <p className="font-headline text-xl mb-2">
              No se pudo generar el informe
            </p>
            <p className="font-body">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main AI Report Markdown Rendering */}
            <div className="md:col-span-12 bg-surface-container p-10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 prose prose-slate max-w-none text-on-surface">
                {typeof report === "string" ? (
                  <Markdown>{report}</Markdown>
                ) : (
                  <div className="space-y-6">
                    {(report as any)?.titulo && (
                      <h3 className="font-headline text-3xl font-bold text-primary mb-2">
                        {(report as any).titulo}
                      </h3>
                    )}
                    {(report as any)?.subtitulo && (
                      <p className="text-on-surface-variant italic mb-6">
                        {(report as any).subtitulo}
                      </p>
                    )}

                    {(report as any)?.lo_que_parece_pesar_mas && (
                      <div className="mb-4 text-on-surface">
                        <h4 className="font-headline font-bold text-xl text-secondary mb-2">
                          Lo que parece estar pesando más
                        </h4>
                        <p className="leading-relaxed">
                          {(report as any).lo_que_parece_pesar_mas}
                        </p>
                      </div>
                    )}

                    {(report as any)?.impacto_en_tu_dia_a_dia && (
                      <div className="mb-4 text-on-surface">
                        <h4 className="font-headline font-bold text-xl text-secondary mb-2">
                          Cómo está tocando tu día a día
                        </h4>
                        <p className="leading-relaxed">
                          {(report as any).impacto_en_tu_dia_a_dia}
                        </p>
                      </div>
                    )}

                    {(report as any)
                      ?.lo_que_podria_necesitar_tu_momento_actual && (
                      <div className="mb-4 text-on-surface">
                        <h4 className="font-headline font-bold text-xl text-secondary mb-2">
                          Lo que tu momento actual parece necesitar
                        </h4>
                        <p className="leading-relaxed">
                          {
                            (report as any)
                              .lo_que_podria_necesitar_tu_momento_actual
                          }
                        </p>
                      </div>
                    )}

                    {(report as any)
                      ?.lo_que_esta_conversacion_ha_permitido_ver && (
                      <div className="mb-4 text-on-surface">
                        <h4 className="font-headline font-bold text-xl text-secondary mb-2">
                          Lo que ya hemos podido ordenar juntos
                        </h4>
                        <p className="leading-relaxed">
                          {
                            (report as any)
                              .lo_que_esta_conversacion_ha_permitido_ver
                          }
                        </p>
                      </div>
                    )}

                    {(report as any)?.siguiente_paso && (
                      <div className="mb-4 text-on-surface">
                        <h4 className="font-headline font-bold text-xl text-secondary mb-2">
                          El siguiente paso, sin empezar desde cero
                        </h4>
                        <p className="leading-relaxed">
                          {(report as any).siguiente_paso}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="font-body text-on-surface-variant text-sm text-center sm:text-left flex-1">
                  <p>
                    Recuerda: esto no es el dossier final, sino un resumen comprensivo previo al Cuestionario Espejo.{" "}
                    <span className="font-medium text-primary">¿Sientes que refleja cómo te encuentras?</span>
                  </p>
                </div>
                {!feedbackGiven ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                      <button
                        onClick={() => handleFeedback(true)}
                        className="px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          thumb_up
                        </span>{" "}
                        Totalmente
                      </button>
                      <button
                        onClick={() =>
                          setReportFeedback(
                            (prev) =>
                              ({
                                agrees: false,
                                label: "no_del_todo",
                                showCommentBox: true,
                              }) as any,
                          )
                        }
                        className="px-5 py-2 rounded-full border border-on-surface-variant text-on-surface-variant hover:bg-on-surface-variant hover:text-white transition-colors text-sm font-label font-bold flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          thumb_down
                        </span>{" "}
                        No del todo
                      </button>
                    </div>
                    {(reportFeedback as any)?.showCommentBox && (
                      <div className="mt-2 text-sm flex flex-col gap-2">
                        <p className="text-on-surface-variant font-medium">
                          ¿Qué parte no encaja o qué crees que falta?
                        </p>
                        <textarea
                          id="feedbackCommentBox"
                          rows={2}
                          className="w-full text-on-surface border border-outline-variant rounded-md p-2 bg-transparent focus:outline-none focus:border-primary"
                        ></textarea>
                        <button
                          onClick={() => {
                            const comment = (
                              document.getElementById(
                                "feedbackCommentBox",
                              ) as HTMLTextAreaElement
                            ).value;
                            handleFeedback(false, comment);
                          }}
                          className="self-end px-4 py-1 bg-primary text-on-primary rounded-full font-label font-bold text-xs hover:bg-primary-container hover:text-primary transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-secondary font-bold text-sm bg-secondary/10 px-4 py-2 rounded-[24px] flex flex-col gap-1 items-start">
                    <div className="flex gap-2 items-center">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      {reportFeedback?.label === "totalmente"
                        ? "Gracias por validarlo."
                        : "Gracias por indicarlo."}
                    </div>
                  </div>
                )}
              </div>
              {user?.email === "davidcaparrosgarcia@gmail.com" && (
                <button
                  onClick={handleClearTesterReport}
                  className="absolute top-4 right-4 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold hover:bg-error/20 transition-all z-20"
                >
                  Limpiar informe de prueba
                </button>
              )}
            </div>

            {/* Dossier Card */}
            <div
              className="md:col-span-6 p-8 rounded-[2rem] border border-outline-variant/10 group flex flex-col relative overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: "url('/images/fondo_dosier.jpg')" }}
              onClick={() => {
                if (window.matchMedia("(hover: none)").matches) {
                  setShowDossierText((prev) => !prev);
                }
              }}
              onMouseLeave={() => setShowDossierText(false)}
            >
              <div className="absolute inset-0 bg-white/40 dark:bg-[#162839]/50 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div
                  className={`transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 ${showDossierText ? "opacity-100" : "opacity-0"}`}
                >
                  <div className="bg-black/40 backdrop-blur-md px-6 py-5 border border-white/10 rounded-2xl shadow-xl">
                    <h4 className="text-3xl font-headline font-bold text-white mb-4">
                      Dossier Espejo personalizado
                    </h4>
                    <p className="text-white/90 font-label text-lg md:text-xl">
                      {!questionnaireCompleted &&
                        "Completa primero los pasos previos para desbloquear tu dossier personalizado."}
                      {questionnaireCompleted &&
                        !dossierAvailable &&
                        "Tu dossier se está preparando. En cuanto esté disponible, podrás acceder desde aquí."}
                      {dossierAvailable &&
                        !dossierViewed &&
                        "Tu dossier ya está disponible. Accede con tu clave personal para consultarlo."}
                      {dossierViewed &&
                        "Tu dossier ya ha sido desbloqueado. Puedes volver a consultarlo cuando lo necesites."}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasConsultation) {
                        navigate("/session");
                      } else if (hasConsultation && !questionnaireCompleted) {
                        setIsNextStepsModalOpen(true);
                      } else if (questionnaireCompleted && !dossierAvailable) {
                        // Deshabilitado visualmente, sin navegación
                      } else if (dossierAvailable) {
                        navigate("/dossier-espejo");
                      }
                    }}
                    disabled={questionnaireCompleted && !dossierAvailable}
                    className={`px-8 py-3 rounded-full font-label font-bold text-sm transition-all focus:outline-none flex w-fit ${
                      questionnaireCompleted && !dossierAvailable
                        ? "bg-outline-variant/20 dark:bg-outline-variant/40 text-on-surface-variant dark:text-[#43474c] cursor-not-allowed opacity-70"
                        : "bg-primary text-on-primary hover:bg-primary-container hover:text-primary shadow-md hover:scale-105 cursor-pointer"
                    }`}
                  >
                    {!hasConsultation && "Realizar consulta gratuita"}
                    {hasConsultation &&
                      !questionnaireCompleted &&
                      "Solicitar Cuestionario Espejo"}
                    {questionnaireCompleted &&
                      !dossierAvailable &&
                      "Dossier en preparación"}
                    {dossierAvailable && "Acceder al dossier"}
                  </button>
                  {user?.email === "davidcaparrosgarcia@gmail.com" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dossier-espejo?testerPreview=1");
                      }}
                      className="mt-3 px-6 py-2 rounded-full bg-white/90 text-primary font-label font-bold text-xs shadow-md hover:bg-white transition-all w-fit"
                    >
                      Vista tester del dossier
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps Checklist */}
            <div
              id="next-steps"
              className="md:col-span-6 bg-white dark:bg-[#d1e7e4] p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 flex flex-col justify-center scroll-mt-24"
            >
              <h4 className="text-3xl font-headline font-bold text-primary dark:text-[#2c3e50] mb-8">
                Próximos Pasos
              </h4>
              <div className="space-y-6">
                {/* 1. Consulta Gratuita */}
                {activeNextStep === "consulta" ? (
                  <div
                    onClick={() => navigate("/session")}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">
                        Consulta Gratuita
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        Empieza por la Consulta Gratuita para contarnos qué te
                        ocurre y preparar tu primera lectura orientativa.{" "}
                        <span className="font-medium text-primary dark:text-[#2c3e50]">
                          Realizar ahora
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center ${hasConsultation ? "border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10" : "border-outline-variant dark:border-[#2c3e50]/30"}`}
                    >
                      {hasConsultation && (
                        <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">
                        Consulta Gratuita
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        Has completado tu primera consulta y ya contamos con una
                        base inicial para orientarte mejor.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Cuestionario Espejo */}
                {activeNextStep === "cuestionario" ? (
                  <div
                    onClick={() => setIsNextStepsModalOpen(true)}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">
                        Cuestionario Espejo
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        El siguiente paso es solicitar el Cuestionario Espejo
                        para completar tu primera lectura con experiencias
                        concretas de tu día a día.{" "}
                        <span className="font-medium text-primary dark:text-[#2c3e50]">
                          Solicitar ahora
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center ${questionnaireRequested || questionnaireCompleted ? "border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10" : "border-outline-variant dark:border-[#2c3e50]/30"}`}
                    >
                      {(questionnaireRequested || questionnaireCompleted) && (
                        <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">
                        Cuestionario Espejo
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        El Cuestionario Espejo ayuda a completar tu primera
                        lectura con situaciones cotidianas para que el equipo
                        humano tenga más contexto.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Dossier Espejo personalizado */}
                {activeNextStep === "dossier" ? (
                  <div
                    onClick={() => {
                      if (dossierAvailable) {
                        navigate("/dossier-espejo");
                      }
                    }}
                    className={`flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 transition-all group shadow-sm hover:shadow-md mb-2 ${dossierAvailable ? "cursor-pointer" : "cursor-default opacity-80"}`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">
                        Dossier Espejo personalizado
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        Tu Dossier Espejo reunirá la información de tu consulta
                        y del cuestionario para ofrecerte una lectura más
                        completa y personalizada.{" "}
                        <span className="font-medium text-primary dark:text-[#2c3e50]">
                          {dossierAvailable
                            ? "Acceder ahora"
                            : "En preparación"}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center ${dossierAvailable ? "border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10" : "border-outline-variant dark:border-[#2c3e50]/30"}`}
                    >
                      {dossierAvailable && (
                        <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">
                        Dossier Espejo personalizado
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light">
                        Cuando esté disponible, tu Dossier Espejo reunirá la
                        información de tu consulta y del cuestionario en una
                        lectura más completa y personalizada.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Sesión de Validación */}
                {activeNextStep === "validacion" ? (
                  <div
                    onClick={() => {
                      alert("Esta funcionalidad estará disponible pronto.");
                    }}
                    className="flex gap-4 p-4 -mx-4 border border-outline-variant/30 dark:border-primary/20 rounded-xl hover:bg-surface-container-lowest dark:hover:bg-white/40 cursor-pointer transition-all group shadow-sm hover:shadow-md mb-2"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center border-outline-variant dark:border-[#2c3e50]/30 group-hover:border-primary transition-colors"></div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50] group-hover:underline decoration-1 underline-offset-4">
                        Sesión de Validación
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light mb-2">
                        Cuando hayas revisado tu dossier, podrás valorar una
                        sesión humana para resolver dudas y decidir si quieres
                        continuar con acompañamiento personalizado.{" "}
                        <span className="font-medium text-primary dark:text-[#2c3e50]">
                          Agendar ahora
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center ${dossierViewed /* assuming validacion comes after dossierViewed */ ? "border-secondary dark:border-[#2c3e50] bg-secondary/10 dark:bg-[#2c3e50]/10" : "border-outline-variant dark:border-[#2c3e50]/30"}`}
                    >
                      {dossierViewed && (
                        <span className="material-symbols-outlined text-secondary dark:text-[#2c3e50] text-sm font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary dark:text-[#2c3e50]">
                        Sesión de Validación
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-[#43474c] font-light mb-2">
                        Después del dossier, podrás valorar una sesión humana
                        para resolver dudas y decidir si quieres continuar con
                        acompañamiento personalizado.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SHARE THE LIGHT FOOTER CTA */}
      <section className="max-w-screen-xl mx-auto px-6 mb-24">
        <div className="bg-[#f1f5f9] dark:bg-[#d1e7e4] p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-[#162839] dark:text-[#2c3e50] mb-6">
              ¿Le ha servido este proceso?
            </h2>
            <p className="text-lg text-[#334155] dark:text-[#43474c] max-w-2xl mx-auto mb-10">
              Creemos que nadie debería navegar la oscuridad a solas. Comparte SoyBienestar.es con alguien que lo necesite.
            </p>
            <button
              onClick={handleShare}
              className="bg-[#162839] dark:bg-[#1a252f] text-white px-10 py-4 rounded-full font-label font-semibold flex items-center gap-3 mx-auto hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined">share</span>
              Compartir la Luz
            </button>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/30 dark:bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 dark:bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>
      <NextStepsModal
        isOpen={isNextStepsModalOpen}
        onClose={() => setIsNextStepsModalOpen(false)}
        user={user}
        hasDoneConsultation={hasConsultation}
        emailValue={emailValue}
        phoneValue={phoneValue}
      />
    </div>
  );
}
