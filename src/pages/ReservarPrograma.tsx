import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import SEO from "../components/SEO";
import ProgramPlansSection from "../components/ProgramPlansSection";
import { userCache } from "../lib/userCache";

export default function ReservarPrograma() {
  const hasCachedAccess = userCache.userData && userCache.unlocked;
  const [loading, setLoading] = useState(!hasCachedAccess);
  const [accessGranted, setAccessGranted] = useState(hasCachedAccess);
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAccess = auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (user.email === 'davidcaparrosgarcia@gmail.com') {
          setAccessGranted(true);
          setLoading(false);
          return;
        }
        try {
          if (!hasCachedAccess) setLoading(true);

          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            userCache.userData = data;

            if (data.dossierAvailableAt && data.dossierViewedAt) {
              setAccessGranted(true);
              userCache.unlocked = true;
            } else {
              setAccessGranted(false);
              navigate('/method');
            }
          } else {
             setAccessGranted(false);
             navigate('/method');
          }
        } catch (error) {
          console.error("Error accessing user data", error);
          setAccessGranted(false);
          navigate('/');
        }
      } else {
        setAccessGranted(false);
        navigate('/');
      }
      setLoading(false);
    });
    
    return () => checkAccess();
  }, [auth, db, navigate, hasCachedAccess]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-on-background/70 font-body animate-pulse">Verificando acceso a los programas...</p>
      </div>
    );
  }

  if (!accessGranted) {
    return null; // Will navigate away
  }

  // Get plan from search params if any
  const queryParams = new URLSearchParams(location.search);
  const planParam = queryParams.get('plan') as "basico" | "intermedio" | "completo" | null;

  return (
    <>
      <SEO 
        title="Reservar Programa Personalizado | SoyBienestar"
        description="Reserva tu programa de acompañamiento terapéutico y personal."
        noIndex={true} // It's a private page
      />
      <div className="min-h-screen bg-background px-4 py-32 overflow-x-hidden relative">
         <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
          <div className="absolute top-1/4 -right-1/4 w-3/4 aspect-square bg-[#7aa2a9] rounded-full mix-blend-multiply filter blur-[100px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-3/4 aspect-square bg-[#b9d5c8] rounded-full mix-blend-multiply filter blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
            <ProgramPlansSection selectedPlan={planParam} />
        </div>
      </div>
    </>
  );
}
