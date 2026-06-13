import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SEO from "../components/SEO";

export default function SesionValidacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const queryParams = new URLSearchParams(location.search);
  const planParam = queryParams.get("plan") || "intermedio";
  
  // Normalizar planParam por seguridad
  const planId = ["basico", "intermedio", "completo", "hipnodigest"].includes(planParam) ? planParam : "intermedio";
  
  const modeParam = queryParams.get("mode");
  const initialMode = modeParam === "reservation" ? "reserva" : (modeParam === "full" ? "unico" : "unico");
  
  const planDetails: Record<string, {
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
      prices: { unico: 1300, reserva: 1300, cuotas: 0 }
    }
  };

  const plan = planDetails[planId];
  const isHipnoDigestPlan = planId === "hipnodigest";
  const [paymentMode, setPaymentMode] = useState<"unico" | "reserva">(initialMode);
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
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");

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
        
        setFullName(prev => {
          if (prev) return prev;
          return mergedData.fullName || mergedData.nombre || mergedData.displayName || mergedData.name || user.displayName || "";
        });
        
        setPhone(prev => {
          if (prev) return prev;
          let p = mergedData.contactPhone || mergedData.telefono || mergedData.phone || mergedData.whatsappPhone || mergedData.smsPhone || "";
          if (p && !p.startsWith("+") && mergedData.contactPhoneCountryCode) {
            p = mergedData.contactPhoneCountryCode + " " + p;
          }
          return p;
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

  const [bankTransferState, setBankTransferState] = useState<"form" | "details" | "done">("form");
  const [bankData, setBankData] = useState<any>(null);

  const totalToPay = paymentMode === "unico" ? plan.prices.unico : plan.prices.reserva;
  // concepto variable is no longer needed since it's generated by the backend

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const mode = paymentMode === "unico" ? "full" : "reservation";
      const token = await user?.getIdToken();
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          planId,
          paymentMode: mode
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

  const handleRegisterIntention = async () => {
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
      const mode = paymentMode === "unico" ? "full" : "reservation";
      const response = await fetch("/api/register-bank-transfer-intent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          planId,
          paymentMode: mode,
          fullName,
          phone,
          age,
          sex
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
        setSuccessMessage("Gracias. Hemos registrado el aviso de transferencia. El equipo revisará el ingreso manualmente antes de confirmar la reserva.");
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
                  <p className="text-4xl font-headline text-primary mb-2">{plan.prices.unico} €</p>
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
                  <p className="text-4xl font-headline text-primary mb-2">
                    {plan.prices.reserva} € <span className="text-base font-body text-on-surface-variant">de reserva hoy</span>
                  </p>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    {isHipnoDigestPlan
                      ? "Reserva tu plaza para iniciar el proceso HipnoDigest. El equipo confirmará contigo los siguientes pasos del acompañamiento."
                      : `Abona ahora la reserva de espacio. Las 3 mensualidades de ${plan.prices.cuotas} € se gestionarán a posteriori.`}
                  </p>
                </div>
              </label>
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
              <button 
                onClick={() => setPaymentMethod("paypal")}
                className={`font-label font-bold pb-2 flex items-center gap-2 transition-colors ${paymentMethod === "paypal" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                <span className="material-symbols-outlined text-lg">payments</span> PayPal
              </button>
            </div>

            {/* Tab Contents Component */}
            <div className="min-h-[250px]">
              {paymentMethod === "tarjeta" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary/40">lock</span>
                  <p className="font-body text-on-surface-variant">Para pagos con tarjeta, selecciona Realizar pago con tarjeta y confirma operación desde una plataforma segura.</p>
                </div>
              )}

              {paymentMethod === "transferencia" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  {bankTransferState === "form" && (
                    <>
                      <h4 className="font-label font-bold text-primary">Confirma tus datos antes de continuar</h4>
                      <p className="text-sm text-on-surface-variant font-body">
                        Necesitamos asociar correctamente tu pago manual a tu ficha de usuario y reserva.
                      </p>
                      <div className="grid gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-label font-bold mb-1">Email <span className="text-red-500">*</span></label>
                          <input type="email" readOnly value={user?.email || ""} className="w-full p-3 rounded-lg border border-outline-variant/30 bg-surface-container-highest cursor-not-allowed opacity-70" />
                        </div>
                        <div>
                          <label className="block text-sm font-label font-bold mb-1">Nombre completo <span className="text-red-500">*</span></label>
                          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: María López García" className="w-full p-3 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-label font-bold mb-1">Teléfono móvil (con prefijo) <span className="text-red-500">*</span></label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: +34 600 000 000" className="w-full p-3 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
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
                        Realiza la transferencia usando los siguientes datos. Es <strong>muy importante</strong> que incluyas el concepto indicado para que podamos asociarla correctamente.
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
                          <span className="font-mono text-lg font-bold text-primary">{bankData.amountDueToday} €</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {bankTransferState === "done" && (
                    <div className="p-8 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 text-center">
                      <span className="material-symbols-outlined text-4xl text-green-500 mb-4 block">task_alt</span>
                      <h4 className="font-label font-bold text-green-800 dark:text-green-400 mb-2">Aviso de transferencia registrado</h4>
                      <p className="text-sm text-green-700 dark:text-green-500">
                        Gracias. Hemos registrado tu aviso. El equipo revisará el ingreso en la cuenta bancaria manualmente. 
                        Te contactaremos una vez confirmado para avanzar a tu sesión.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "paypal" && (
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
                  <span className="text-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{paymentMode === "unico" ? "pago único" : "de reserva"}</span>
                </div>
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
                  {loading ? "Registrando..." : "Guardar datos y continuar"} <span className="material-symbols-outlined">arrow_forward</span>
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

              {paymentMethod === "paypal" && (
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
    </>
  );
}
