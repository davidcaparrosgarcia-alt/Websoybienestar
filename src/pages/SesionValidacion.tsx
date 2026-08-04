import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import SEO from "../components/SEO";

type ContactUsage = "unchanged" | "reservation_only" | "profile_saved";

export default function SesionValidacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const queryParams = new URLSearchParams(location.search);
  const rawPlanParam = queryParams.get("plan");
  
  const validPlans = ["basico", "intermedio", "completo", "hipnodigest"] as const;
  const planId = (rawPlanParam && validPlans.includes(rawPlanParam as any))
    ? rawPlanParam as typeof validPlans[number]
    : null;
  
  const modeParam = queryParams.get("mode");
  const initialMode = modeParam === "reservation" ? "reserva" : 
                      ((modeParam === "full" || modeParam === "unico") ? "unico" : 
                      ((modeParam === "saldo" || modeParam === "balance") ? "saldo" : "unico"));
  
  const planDetails: Record<typeof validPlans[number], {
    name: string;
    duration: string;
    prices: {
      unico: number;
      reserva: number;
      cuotas: number;
    }
  }> = {
    "basico": {
      name: "Plan Básico",
      duration: "3 meses de acompañamiento esencial.",
      prices: { unico: 550, reserva: 90, cuotas: 170 }
    },
    "intermedio": {
      name: "Plan Intermedio",
      duration: "3 meses de acompañamiento quincenal.",
      prices: { unico: 1700, reserva: 290, cuotas: 570 }
    },
    "completo": {
      name: "Plan Completo",
      duration: "3 meses de acompañamiento intensivo.",
      prices: { unico: 2200, reserva: 400, cuotas: 700 }
    },
    "hipnodigest": {
      name: "HipnoDigest",
      duration: "4 meses de acompañamiento digestivo-emocional con valoración inicial.",
      prices: { unico: 1300, reserva: 300, cuotas: 0 }
    }
  };

  const plan = planId ? planDetails[planId] : null;
  const isHipnoDigestPlan = planId === "hipnodigest";
  const SHOW_PAYPAL_METHOD = false;
  const [paymentMode, setPaymentMode] = useState<"unico" | "reserva" | "saldo">(initialMode);
  const [userDbData, setUserDbData] = useState<any>(null);

  const hasReservationEvidence = userDbData && 
    userDbData.selectedProgram === "hipnodigest" &&
    userDbData.selectedProgramPaymentMode === "reservation" &&
    (userDbData.selectedProgramPaymentStatus === "confirmed" || userDbData.selectedProgramPaymentStatus === "pending_bank_review");

  const hasNewReservationEvidence = userDbData &&
    (userDbData.hipnoDigestReservationStatus === "confirmed" || userDbData.hipnoDigestReservationStatus === "pending_bank_review");

  const showCompletaTuPago = isHipnoDigestPlan && (hasReservationEvidence || hasNewReservationEvidence);

  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "transferencia" | "paypal">("tarjeta");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isReturningFromSuccessfulCardPayment = queryParams.get("payment") === "success";

  useEffect(() => {
    const payment = queryParams.get("payment");
    if (payment === "success") {
      setSuccessMessage("Pago realizado. Estamos confirmando el estado del pago de forma segura.");
    } else if (payment === "cancelled") {
      setErrorMessage("El pago se canceló. Puedes intentarlo de nuevo cuando quieras.");
    }
  }, [location.search]);

  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");

  const [originalContactData, setOriginalContactData] = useState<{
    fullName: string;
    contactEmail: string;
    phone: string;
  } | null>(null);

  const [confirmedContactUsage, setConfirmedContactUsage] = useState<ContactUsage | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [contactConfirmOpen, setContactConfirmOpen] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState<"card" | "transfer" | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const profileRef = doc(db, "userProfiles", user.uid);
        const [userSnap, profileSnap] = await Promise.all([getDoc(userRef), getDoc(profileRef)]);
        
        const userData = userSnap.exists() ? userSnap.data() : {};
        const profileData = profileSnap.exists() ? profileSnap.data() : {};
        
        const mergedData = { ...profileData, ...userData }; // userData takes precedence
        setUserDbData(mergedData);
        
        const initialFullName = mergedData.fullName || mergedData.nombre || mergedData.displayName || mergedData.name || user.displayName || "";
        const initialContactEmail = mergedData.contactEmail || mergedData.email || user.email || "";
        let initialPhone = mergedData.contactPhone || mergedData.telefono || mergedData.phone || mergedData.whatsappPhone || mergedData.smsPhone || "";
        if (initialPhone && !initialPhone.startsWith("+") && mergedData.contactPhoneCountryCode) {
          initialPhone = mergedData.contactPhoneCountryCode + " " + initialPhone;
        }

        setFullName(prev => prev || initialFullName);
        setContactEmail(prev => prev || initialContactEmail);
        setPhone(prev => prev || initialPhone);

        setOriginalContactData(prev => prev || {
          fullName: initialFullName,
          contactEmail: initialContactEmail,
          phone: initialPhone
        });
        
        setAge(prev => {
          if (prev) return prev;
          return mergedData.edad || mergedData.profileAge || mergedData.age || mergedData.birthDate || "";
        });
        
        setSex(prev => {
          if (prev) return prev;
          let s = String(mergedData.sexo || mergedData.gender || mergedData.sex || mergedData.genero || "").toLowerCase();
          if (["mujer", "femenino", "female", "fem"].includes(s)) return "femenino";
          if (["hombre", "masculino", "male", "masc"].includes(s)) return "masculino";
          if (["prefiero_no_definirme", "prefiero_no_decirlo", "no_definido"].includes(s)) return "prefiero_no_decirlo";
          if (s === "otro") return "otro";
          return "";
        });
      } catch (error) {
        console.error("Error loading user data for checkout:", error);
      }
    }
    loadUserData();
  }, [user]);

  const hasContactChanges =
    !!originalContactData &&
    (
      fullName.trim() !== originalContactData.fullName.trim() ||
      contactEmail.trim() !== originalContactData.contactEmail.trim() ||
      phone.trim() !== originalContactData.phone.trim()
    );

  const saveContactDataToProfile = async () => {
    if (!user?.uid) return;
    const payload = {
      fullName: fullName.trim(),
      nombre: fullName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: phone.trim(),
      telefono: phone.trim(),
      contactDataUpdatedAt: Date.now()
    };

    await Promise.all([
      setDoc(doc(db, "users", user.uid), payload, { merge: true }),
      setDoc(doc(db, "userProfiles", user.uid), payload, { merge: true })
    ]);

    setOriginalContactData({
      fullName: fullName.trim(),
      contactEmail: contactEmail.trim(),
      phone: phone.trim()
    });
  };

  const [bankTransferState, setBankTransferState] = useState<"form" | "details" | "done">("form");
  const [bankData, setBankData] = useState<any>(null);

  if (!planId || !plan) {
    return (
      <>
        <SEO title="Programa no identificado | SoyBienestar" description="No hemos podido identificar el programa seleccionado." canonicalPath="/sesion-validacion" noIndex={true} />
        <div className="flex-grow pt-28 pb-20 px-6 max-w-3xl mx-auto w-full flex items-center justify-center">
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-xl p-8 md:p-10 text-center space-y-6">
            <span className="material-symbols-outlined text-primary text-5xl">info</span>
            <h1 className="font-headline text-3xl md:text-4xl text-primary">
              No hemos podido identificar el programa
            </h1>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Para evitar mostrar un precio incorrecto, necesitamos que vuelvas a seleccionar el programa desde su página correspondiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate("/hipnodigestive")}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label font-bold hover:opacity-90 transition-opacity"
              >
                Volver a HipnoDigest
              </button>
              <button
                type="button"
                onClick={() => navigate("/reservar-programa")}
                className="px-6 py-3 rounded-xl bg-surface-container-high text-primary border border-outline-variant/20 font-label font-bold hover:bg-surface-container-highest transition-colors"
              >
                Ver otros programas
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalToPay = paymentMode === "unico" ? plan.prices.unico : (paymentMode === "reserva" ? plan.prices.reserva : 1000);
  // concepto variable is no longer needed since it's generated by the backend

  const handleCheckoutInternal = async (contactUsage: ContactUsage = "unchanged") => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const mode = paymentMode === "unico" ? "full" : (paymentMode === "reserva" ? "reservation" : "balance");
      const token = await user?.getIdToken();
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          planId,
          paymentMode: mode,
          contactSnapshot: {
            fullName: fullName.trim(),
            contactEmail: contactEmail.trim(),
            phone: phone.trim()
          },
          contactUsage
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || "Error al iniciar el pago.");
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  const handleRegisterIntentionInternal = async (contactUsage: ContactUsage = "unchanged") => {
    if (!fullName || fullName.trim().split(/\s+/).length < 2) {
      setErrorMessage("Por favor, introduce al menos nombre y primer apellido.");
      return;
    }
    const numericPhone = phone.replace(/\D/g, "");
    if (numericPhone.length < 4) {
      setErrorMessage("Por favor, introduce un teléfono válido (mínimo 4 dígitos).");
      return;
    }
    if (!age || !sex) {
      setErrorMessage("Por favor, completa todos los campos (edad y sexo).");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const token = await user?.getIdToken();
      const mode = paymentMode === "unico" ? "full" : (paymentMode === "reserva" ? "reservation" : "balance");
      const response = await fetch("/api/register-bank-transfer-intent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          planId,
          paymentMode: mode,
          fullName: fullName.trim(),
          contactEmail: contactEmail.trim(),
          phone: phone.trim(),
          age,
          sex,
          contactSnapshot: {
            fullName: fullName.trim(),
            contactEmail: contactEmail.trim(),
            phone: phone.trim()
          },
          contactUsage
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setBankData(data);
        setBankTransferState("details");
      } else {
        setErrorMessage(data.error || "Error al registrar intención de pago.");
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithPendingAction = async (saveProfile: boolean) => {
    const action = pendingPaymentAction;
    setContactConfirmOpen(false);
    setPendingPaymentAction(null);

    const usage: ContactUsage = saveProfile ? "profile_saved" : "reservation_only";
    setConfirmedContactUsage(usage);

    if (saveProfile) {
      try {
        await saveContactDataToProfile();
      } catch (error) {
        setErrorMessage("No hemos podido guardar los datos en tu perfil. Puedes continuar usando estos datos solo para esta reserva.");
        return;
      }
    }

    if (action === "card") {
      await handleCheckoutInternal(usage);
    } else if (action === "transfer") {
      await handleRegisterIntentionInternal(usage);
    }
  };

  const handleCheckout = async () => {
    if (hasContactChanges && !confirmedContactUsage) {
      setPendingPaymentAction("card");
      setContactConfirmOpen(true);
      return;
    }

    await handleCheckoutInternal(confirmedContactUsage || "unchanged");
  };

  const handleRegisterIntention = async () => {
    if (hasContactChanges && !confirmedContactUsage) {
      setPendingPaymentAction("transfer");
      setContactConfirmOpen(true);
      return;
    }

    await handleRegisterIntentionInternal(confirmedContactUsage || "unchanged");
  };

  const handleMarkTransferDone = async () => {
    if (!bankData?.paymentIntentId) return;
    setLoading(true);
    setErrorMessage("");
    
    try {
      const token = await user?.getIdToken();
      const response = await fetch("/api/mark-bank-transfer-done", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          paymentIntentId: bankData.paymentIntentId
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setBankTransferState("done");
        setSuccessMessage("Gracias. Tu aviso de transferencia ha quedado registrado. Revisaremos el ingreso y nos pondremos en contacto contigo usando los datos de esta página para confirmar los siguientes pasos.");
      } else {
        setErrorMessage(data.error || "Error al actualizar el estado de la transferencia.");
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Sesión de validación | SoyBienestar" description="Página privada para continuar el proceso de acompañamiento en SoyBienestar.es." canonicalPath="/sesion-validacion" noIndex={true} />

      

    <div className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-24 px-6 lg:px-12 max-w-[1280px] mx-auto w-full">
      {successMessage && (
        <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 shadow-sm">
          <p className="font-body flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> {successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 shadow-sm">
          <p className="font-body flex items-center gap-2"><span className="material-symbols-outlined">error</span> {errorMessage}</p>
        </div>
      )}
      <header className="hidden md:flex mb-10 lg:mb-12 flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="md:w-2/3">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-[3.5rem] leading-tight text-primary mb-6">
            Confirma tu espacio de serenidad
          </h1>
          <p className="text-lg font-body text-on-surface-variant max-w-2xl">
            Completa los detalles de tu reserva para asegurar tu Sesión de Validación. Un paso más hacia tu arquitectura interior.
          </p>
        </div>
        <button 
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/reservar-programa');
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label font-bold text-sm tracking-wide hover:border-primary hover:text-primary transition-colors bg-surface-container-lowest shadow-sm h-fit shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Left Column: Summary & Schedule */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          {/* Plan Summary Card */}
          <article className="bg-[#162839] rounded-2xl overflow-hidden shadow-xl">
            <div className="h-48 w-full bg-surface-container-highest relative">
              <img 
                src="/images/fondo_privacidad.jpg" 
                alt="Fondo privado" 
                className="w-full h-full object-cover opacity-90 mix-blend-multiply" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-[#162839] opacity-40"></div>
              <h2 className="absolute bottom-6 left-6 text-on-primary font-headline text-3xl">Programa de Claridad</h2>
            </div>
            
            <div className="p-8 bg-surface-container-low rounded-b-2xl">
              <ul className="flex flex-col gap-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">schedule</span>
                  <div>
                    <p className="font-semibold font-label text-on-surface">Duración del ciclo</p>
                    <p className="text-on-surface-variant text-sm mt-1">{plan.duration}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">video_camera_front</span>
                  <div>
                    <p className="font-semibold font-label text-on-surface">Formato</p>
                    <p className="text-on-surface-variant text-sm mt-1">Encuentros virtuales 1 a 1 en entorno privado de alta resolución.</p>
                  </div>
                </li>
              </ul>
            </div>
          </article>

          {/* Agenda Card */}
          <aside className="bg-surface-container-lowest rounded-2xl p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-8xl">calendar_month</span>
            </div>
            <h3 className="font-headline text-2xl text-primary mb-6">Tu primera sesión</h3>
            <div className="flex flex-col gap-4 font-body">
              <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">contact_mail</span>
                  <div>
                    <p className="font-semibold font-label text-on-surface">Datos de contacto de la reserva</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Usaremos estos datos para identificar tu reserva y ponernos en contacto contigo después del pago.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 mt-3">
                  <label className="block">
                    <span className="block text-xs font-label font-bold text-on-surface-variant mb-1">Nombre completo</span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setConfirmedContactUsage(null);
                      }}
                      placeholder="Nombre y apellidos"
                      className="w-full p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-label font-bold text-on-surface-variant mb-1">Email de contacto</span>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        setConfirmedContactUsage(null);
                      }}
                      placeholder="tu@email.com"
                      className="w-full p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-label font-bold text-on-surface-variant mb-1">Teléfono de contacto</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setConfirmedContactUsage(null);
                      }}
                      placeholder="+34 600 000 000"
                      className="w-full p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </label>
                </div>

                {hasContactChanges && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3 font-body">
                    <p className="text-xs font-bold text-primary">
                      Has cambiado los datos de contacto. Elige ahora cómo quieres usar estos cambios.
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Puedes usarlos solo para este pago o guardarlos también en tu perfil para futuras reservas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setConfirmedContactUsage("reservation_only")}
                        className={`px-3 py-2 rounded-lg text-xs font-label font-bold transition-colors ${
                          confirmedContactUsage === "reservation_only"
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-primary border border-outline-variant/20 hover:bg-surface-container-highest"
                        }`}
                      >
                        {confirmedContactUsage === "reservation_only" ? "✓ Usar solo para este pago" : "Usar solo para este pago"}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingProfile}
                        onClick={async () => {
                          setIsSavingProfile(true);
                          try {
                            await saveContactDataToProfile();
                            setConfirmedContactUsage("profile_saved");
                          } catch (error) {
                            setErrorMessage("No hemos podido guardar los datos en tu perfil. Puedes usarlos solo para este pago.");
                          } finally {
                            setIsSavingProfile(false);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-label font-bold transition-colors ${
                          confirmedContactUsage === "profile_saved"
                            ? "bg-primary text-on-primary"
                            : "bg-primary text-on-primary hover:opacity-90"
                        } ${isSavingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isSavingProfile ? "Guardando..." : confirmedContactUsage === "profile_saved" ? "✓ Guardado en tu perfil" : "Guardar en mi perfil"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
                <span className="text-on-surface font-medium">Fecha acordada</span>
                <span className="text-primary font-semibold">Pendiente de confirmar</span>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
                <span className="text-on-surface font-medium">Hora</span>
                <span className="text-primary font-semibold">Pendiente de confirmar</span>
              </div>
            </div>
            <button 
              onClick={() => console.log("Pendiente agenda")}
              className="mt-6 text-primary text-sm font-label font-bold hover:underline flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span> Modificar agenda
            </button>
          </aside>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          {isReturningFromSuccessfulCardPayment ? (
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-xl border border-outline-variant/10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
              </div>
              <h2 className="font-headline text-3xl md:text-4xl text-primary mb-4">Pago realizado</h2>
              <p className="text-xl text-on-surface-variant font-light leading-relaxed max-w-lg mb-8">
                Has completado el pago de <strong>{plan.name}</strong> — {paymentMode === "unico" ? "pago único" : "reserva"}.
              </p>
              <div className="bg-surface-container-low p-6 rounded-2xl w-full text-left mb-8">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary shrink-0 mt-1">shield</span>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Estamos confirmando la operación de forma segura. Si la confirmación no aparece reflejada de inmediato, no repitas el pago.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="bg-primary hover:opacity-90 text-on-primary px-8 py-4 rounded-xl font-bold font-label transition-opacity shadow-md"
              >
                Volver al inicio
              </button>
            </div>
          ) : (
            <>
              {/* Payment Mode Selection */}
              <section>
            <h3 className="font-headline text-3xl text-primary mb-6">Selecciona tu modalidad de inversión</h3>
            <p className="text-on-surface-variant font-label mb-6 text-sm">Mostrando opciones para: <strong className="text-primary">{plan.name}</strong></p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Option 1 */}
              <label className="cursor-pointer relative">
                <input 
                  type="radio" 
                  name="payment_plan" 
                  className="peer sr-only" 
                  checked={paymentMode === "unico"}
                  onChange={() => setPaymentMode("unico")}
                />
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md transition-all duration-300 ring-2 ring-transparent peer-checked:ring-primary peer-checked:bg-surface-container-low hover:bg-surface-container-low h-full flex flex-col justify-start">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-headline text-xl text-primary">Pago Único</span>
                    <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                  </div>
                  <p className="text-4xl font-headline text-primary mb-1">{plan.prices.unico} €</p>
                  <p className="text-xs text-on-surface-variant/80 mb-3 font-body">IVA e impuestos incluidos</p>
                  <p className="text-sm font-body text-on-surface-variant">Acceso completo al programa sin compromisos de cuotas mensuales.</p>
                </div>
              </label>

              {/* Option 2 */}
              <label className="cursor-pointer relative">
                <input 
                  type="radio" 
                  name="payment_plan" 
                  className="peer sr-only" 
                  checked={paymentMode === "reserva"}
                  onChange={() => setPaymentMode("reserva")}
                />
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md transition-all duration-300 ring-2 ring-transparent peer-checked:ring-primary peer-checked:bg-surface-container-low hover:bg-surface-container-low h-full flex flex-col justify-start">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-headline text-xl text-primary">
                      {isHipnoDigestPlan ? "Reserva del programa" : "Reserva + 3 cuotas"}
                    </span>
                    <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                  </div>
                  <p className="text-4xl font-headline text-primary mb-1">
                    {plan.prices.reserva} € <span className="text-base font-body text-on-surface-variant">de reserva hoy</span>
                  </p>
                  <p className="text-xs text-on-surface-variant/80 mb-3 font-body">IVA e impuestos incluidos</p>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    {isHipnoDigestPlan
                      ? "Reserva tu plaza para iniciar el proceso HipnoDigest. El equipo confirmará contigo los siguientes pasos del acompañamiento."
                      : `Abona ahora la reserva de espacio. Las 3 mensualidades de ${plan.prices.cuotas} € se gestionarán a posteriori.`}
                  </p>
                </div>
              </label>

              {/* Option 3 (Completa tu pago - HipnoDigest Saldo) */}
              {showCompletaTuPago && (
                <label className="cursor-pointer relative md:col-span-2">
                  <input 
                    type="radio" 
                    name="payment_plan" 
                    className="peer sr-only" 
                    checked={paymentMode === "saldo"}
                    onChange={() => setPaymentMode("saldo")}
                  />
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md transition-all duration-300 ring-2 ring-transparent peer-checked:ring-primary peer-checked:bg-surface-container-low hover:bg-surface-container-low h-full flex flex-col justify-start border border-primary/20">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-headline text-xl text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lock_open</span> Completa tu pago
                      </span>
                      <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                    </div>
                    <p className="text-4xl font-headline text-primary mb-1">1.000 €</p>
                    <p className="text-xs text-on-surface-variant/80 mb-3 font-body">IVA e impuestos incluidos</p>
                    <p className="text-sm font-body text-on-surface-variant">
                      Abona los 1.000 € restantes de tu programa HipnoDigest. Este pago completará tu inversión inicial.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </section>



          {/* Payment Methods */}
          <section>
            <h3 className="font-headline text-3xl text-primary mb-6">Método de abono</h3>
            
            {/* Tabs */}
            <div className="flex gap-8 border-b border-outline-variant/30 mb-8 pb-2">
              <button 
                onClick={() => setPaymentMethod("tarjeta")}
                className={`font-label font-bold pb-2 flex items-center gap-2 transition-colors ${paymentMethod === "tarjeta" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                <span className="material-symbols-outlined text-lg">credit_card</span> Tarjeta
              </button>
              <button 
                onClick={() => setPaymentMethod("transferencia")}
                className={`font-label font-bold pb-2 flex items-center gap-2 transition-colors ${paymentMethod === "transferencia" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                <span className="material-symbols-outlined text-lg">account_balance</span> Transferencia
              </button>
              {SHOW_PAYPAL_METHOD && (
                <button 
                  onClick={() => setPaymentMethod("paypal")}
                  className={`font-label font-bold pb-2 flex items-center gap-2 transition-colors ${paymentMethod === "paypal" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}
                >
                  <span className="material-symbols-outlined text-lg">payments</span> PayPal
                </button>
              )}
            </div>

            {/* Tab Contents Component */}
            <div className="min-h-[250px]">
              {paymentMethod === "tarjeta" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary/40">lock</span>
                  <p className="font-body text-on-surface-variant leading-relaxed max-w-lg">
                    Después del pago, recibirás una confirmación y nuestro equipo se pondrá en contacto contigo usando los datos indicados en esta página para coordinar el inicio del programa.
                  </p>
                  <p className="text-xs text-on-surface-variant/80 font-body max-w-lg">
                    El pago se realiza en una plataforma segura. Si la confirmación no aparece de inmediato al volver a la web, no repitas el pago; revisaremos la operación de forma segura.
                  </p>
                </div>
              )}

              {paymentMethod === "transferencia" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  {bankTransferState === "form" && (
                    <>
                      <h4 className="font-label font-bold text-primary">Transferencia guiada paso a paso</h4>
                      <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                        Primero comprobaremos tus datos y generaremos un concepto de transferencia único para esta reserva. En el siguiente paso verás el IBAN, el importe exacto y el concepto que deberás copiar en tu transferencia. Cuando la hayas realizado, vuelve a esta pantalla y pulsa “Avisar de que he realizado la transferencia” para dejarla vinculada a tu cuenta.
                      </p>
                      <div className="grid gap-4 mt-4">
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 space-y-2">
                          <p className="font-label font-bold text-sm text-primary">Datos que usaremos para vincular la transferencia</p>
                          <div className="space-y-1 text-sm font-body text-on-surface-variant">
                            <p><strong className="text-on-surface">Nombre:</strong> {fullName || "Pendiente"}</p>
                            <p><strong className="text-on-surface">Email de contacto:</strong> {contactEmail || user?.email || "Pendiente"}</p>
                            <p><strong className="text-on-surface">Teléfono:</strong> {phone || "Pendiente"}</p>
                          </div>
                          <p className="text-xs text-on-surface-variant/80">
                            Si necesitas cambiar estos datos, hazlo en el bloque “Datos de contacto de la reserva” antes de continuar.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-label font-bold mb-1">Edad <span className="text-red-500">*</span></label>
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ej: 35" className="w-full p-3 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-label font-bold mb-1">Sexo <span className="text-red-500">*</span></label>
                            <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                              <option value="">Selecciona</option>
                              <option value="femenino">Femenino</option>
                              <option value="masculino">Masculino</option>
                              <option value="otro">Otro</option>
                              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {bankTransferState === "details" && bankData && (
                    <>
                      <h4 className="font-label font-bold text-primary">Datos para la transferencia</h4>
                      <p className="text-base text-on-surface-variant font-body">
                        Realiza la transferencia con los datos que aparecen aquí. Copia el concepto exactamente como se muestra para que el pago quede vinculado a tu reserva. Cuando termines, pulsa “Avisar de que he realizado la transferencia”.
                      </p>
                      <div className="grid gap-4 mt-6">
                        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                          <span className="text-base font-label text-on-surface-variant">Titular</span>
                          <div className="text-right">
                            <div className="font-mono text-lg text-primary font-bold">{bankData.accountHolder}</div>
                            <div className="text-sm text-on-surface-variant mt-1">{bankData.accountHolderRole}</div>
                          </div>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                          <span className="text-base font-label text-on-surface-variant">IBAN</span>
                          <span className="font-mono text-lg font-bold text-primary">{bankData.iban}</span>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                          <span className="text-base font-label text-on-surface-variant">Concepto requerido</span>
                          <span className="font-mono text-lg bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">{bankData.bankConcept}</span>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                          <span className="text-base font-label text-on-surface-variant">Importe</span>
                          <div className="text-right">
                            <span className="font-mono text-lg font-bold text-primary">{bankData.amountDueToday} €</span>
                            <p className="text-xs text-on-surface-variant/80 mt-1 font-body">IVA e impuestos incluidos</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {bankTransferState === "done" && (
                    <div className="p-8 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 text-center space-y-3">
                      <span className="material-symbols-outlined text-4xl text-green-500 block">task_alt</span>
                      <h4 className="font-label font-bold text-green-800 dark:text-green-400">Aviso de transferencia registrado</h4>
                      <p className="text-sm text-green-700 dark:text-green-500 font-body leading-relaxed max-w-md mx-auto">
                        Gracias. Tu aviso de transferencia ha quedado registrado. Revisaremos el ingreso y nos pondremos en contacto contigo usando los datos de esta página para confirmar los siguientes pasos.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {SHOW_PAYPAL_METHOD && paymentMethod === "paypal" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-center space-y-4">
                   <span className="material-symbols-outlined text-4xl text-primary/40">payments</span>
                   <p className="font-body text-on-surface-variant">PayPal se activará próximamente.</p>
                </div>
              )}
            </div>

            {/* CTA Area */}
            <div className="mt-8 bg-surface-container-lowest p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg border border-outline-variant/10">
              <div>
                <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest mb-1">Total a abonar hoy</p>
                <div className="flex items-baseline gap-2">
                  <p className="font-headline text-4xl text-primary">{totalToPay} €</p>
                  <span className="text-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                    {paymentMode === "unico" ? "pago único" : (paymentMode === "reserva" ? "de reserva" : "saldo restante")}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/80 mt-1 font-body">IVA e impuestos incluidos</p>
              </div>
              
              {paymentMethod === "tarjeta" && (
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-on-primary rounded-xl py-4 px-10 font-bold font-label text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Preparando pago seguro..." : "Realizar pago con tarjeta"} <span className="material-symbols-outlined">lock</span>
                </button>
              )}

              {paymentMethod === "transferencia" && bankTransferState === "form" && (
                <button 
                  onClick={handleRegisterIntention}
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-on-primary rounded-xl py-4 px-10 font-bold font-label text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Continuar y ver datos de transferencia"} <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}
              
              {paymentMethod === "transferencia" && bankTransferState === "details" && (
                <button 
                  onClick={handleMarkTransferDone}
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-on-primary rounded-xl py-4 px-10 font-bold font-label text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Confirmando..." : "Avisar de que he realizado la transferencia"} <span className="material-symbols-outlined">notifications</span>
                </button>
              )}
              
              {paymentMethod === "transferencia" && bankTransferState === "done" && (
                <button 
                  disabled
                  className="w-full md:w-auto bg-surface-container-highest text-on-surface-variant/70 rounded-xl py-4 px-10 font-bold font-label text-sm flex items-center justify-center gap-2 disabled:opacity-100 cursor-not-allowed"
                >
                  Pendiente de revisión <span className="material-symbols-outlined">hourglass_empty</span>
                </button>
              )}

              {SHOW_PAYPAL_METHOD && paymentMethod === "paypal" && (
                <button 
                  disabled
                  className="w-full md:w-auto bg-surface-container-high text-on-surface-variant/50 rounded-xl py-4 px-10 font-bold font-label text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  PayPal pendiente de activación
                </button>
              )}
            </div>
          </section>

          {/* Support */}
          <section className="mt-8 flex justify-end">
            <button className="bg-surface-container-lowest text-primary border border-outline-variant/20 rounded-full py-3 px-6 flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined">chat</span>
              <div className="text-left">
                <span className="block font-label font-bold text-sm">Soporte vía WhatsApp</span>
                <span className="block font-body text-xs text-on-surface-variant">Respuesta en aprox. 24 horas laborables</span>
              </div>
            </button>
          </section>
            </>
          )}

        </div>
      </div>
    </div>

      {contactConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              setContactConfirmOpen(false);
              setPendingPaymentAction(null);
            }}
          />
          <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest rounded-[2rem] shadow-2xl border border-outline-variant/20 p-6 md:p-8 space-y-5">
            <h3 className="font-headline text-2xl text-primary">¿Cómo quieres usar estos datos?</h3>
            <div className="space-y-3 font-body text-on-surface-variant leading-relaxed text-sm md:text-base">
              <p>
                Has cambiado los datos de contacto antes de continuar con la reserva. Elige si quieres usarlos solo para este pago o guardarlos también como tus datos habituales de contacto.
              </p>
              <p className="text-xs md:text-sm text-on-surface-variant/80">
                Si eliges usarlos solo para este pago, tu perfil conservará los datos anteriores.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setContactConfirmOpen(false);
                  setPendingPaymentAction(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-label font-bold text-sm hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => proceedWithPendingAction(false)}
                className="px-5 py-2.5 rounded-xl bg-surface-container-high text-primary border border-outline-variant/20 font-label font-bold text-sm hover:bg-surface-container-highest transition-colors"
              >
                Usar solo para este pago
              </button>
              <button
                type="button"
                onClick={() => proceedWithPendingAction(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Guardar en mi perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
