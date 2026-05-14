import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import SEO from "../components/SEO";

export default function SesionValidacion() {
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const queryParams = new URLSearchParams(location.search);
  const planParam = queryParams.get("plan") || "intermedio";
  
  // Normalizar planParam por seguridad
  const planId = ["basico", "intermedio", "completo"].includes(planParam) ? planParam : "intermedio";
  
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
    }
  };

  const plan = planDetails[planId];
  const [paymentMode, setPaymentMode] = useState<"unico" | "reserva">("unico");
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "transferencia" | "paypal">("tarjeta");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const payment = queryParams.get("payment");
    if (payment === "success") {
      setSuccessMessage("Pago confirmado. Hemos registrado tu reserva.");
    } else if (payment === "cancelled") {
      setErrorMessage("El pago se canceló. Puedes intentarlo de nuevo cuando quieras.");
    }
  }, [location.search]);

  const totalToPay = paymentMode === "unico" ? plan.prices.unico : plan.prices.reserva;
  const concepto = user?.email ? `${user.email}_${planId}` : `nombre@email.com_${planId}`;

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const mode = paymentMode === "unico" ? "full" : "reservation";
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          paymentMode: mode,
          uid: user?.uid,
          email: user?.email
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
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const mode = paymentMode === "unico" ? "full" : "reservation";
      const response = await fetch("/api/register-bank-transfer-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          paymentMode: mode,
          uid: user?.uid,
          email: user?.email,
          concept: concepto
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setSuccessMessage("Hemos registrado tu intención de pago. Realiza la transferencia usando el concepto indicado para que podamos asociarla correctamente.");
      } else {
        setErrorMessage(data.error || "Error al registrar intención de pago.");
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

      

    <div className="flex-grow pt-32 pb-24 px-6 lg:px-12 max-w-[1280px] mx-auto w-full">
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
      <header className="mb-16 md:w-2/3">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-[3.5rem] leading-tight text-primary mb-6">
          Confirma tu espacio de serenidad
        </h1>
        <p className="text-lg font-body text-on-surface-variant max-w-2xl">
          Completa los detalles de tu reserva para asegurar tu Sesión de Validación. Un paso más hacia tu arquitectura interior.
        </p>
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
                  <p className="text-4xl font-headline text-primary mb-2">€{plan.prices.unico}</p>
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
                    <span className="font-headline text-xl text-primary">Reserva + 3 cuotas</span>
                    <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                  </div>
                  <p className="text-4xl font-headline text-primary mb-2">
                    €{plan.prices.reserva} <span className="text-base font-body text-on-surface-variant">hoy</span>
                  </p>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    Abona ahora la reserva de espacio. Las 3 mensualidades de {plan.prices.cuotas}€ se gestionarán a posteriori.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Concept Instruction */}
          <section className="bg-surface-container-low rounded-2xl p-8 border-l-4 border-primary">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary mt-1">info</span>
              <div>
                <h4 className="font-label font-bold text-primary mb-2">Instrucción importante para el concepto bancario</h4>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Para asociar tu pago correctamente, es obligatorio incluir el siguiente formato en el campo de concepto de tu banco o plataforma de pago: <br/>
                  <strong className="text-on-surface mt-3 mb-2 inline-block font-mono bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[13px] tracking-wide">
                    {concepto}
                  </strong> <br/>
                  Requerido para todas las formas de pago manual.
                </p>
              </div>
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
                  <p className="font-body text-on-surface-variant">Serás redirigido a la pasarela de pago segura de Stripe para completar la transacción.</p>
                </div>
              )}

              {paymentMethod === "transferencia" && (
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 space-y-6">
                  <h4 className="font-label font-bold text-primary">Datos para la transferencia</h4>
                  <div className="grid gap-4">
                    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                      <span className="text-sm font-label text-on-surface-variant">Titular</span>
                      <span className="font-mono text-sm text-primary">PENDIENTE DE CONFIGURAR</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                      <span className="text-sm font-label text-on-surface-variant">IBAN</span>
                      <span className="font-mono text-sm font-bold text-primary">PENDIENTE DE CONFIGURAR</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center">
                      <span className="text-sm font-label text-on-surface-variant">Concepto requerido</span>
                      <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">{concepto}</span>
                    </div>
                  </div>
                  {/* TODO: sustituir por datos bancarios reales autorizados por el cliente. */}
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
                <p className="font-headline text-4xl text-primary">€{totalToPay}</p>
              </div>
              
              {paymentMethod === "tarjeta" && (
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-on-primary rounded-xl py-4 px-10 font-bold font-label text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Preparando pago seguro..." : "Continuar a pago seguro"} <span className="material-symbols-outlined">lock</span>
                </button>
              )}

              {paymentMethod === "transferencia" && (
                <button 
                  onClick={handleRegisterIntention}
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-on-primary rounded-xl py-4 px-10 font-bold font-label text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Registrar intención de transferencia"} <span className="material-symbols-outlined">arrow_forward</span>
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

        </div>
      </div>
    </div>
    </>
  );
}
