/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Session from "./pages/Session";
import SessionEnded from "./pages/SessionEnded";
import Report from "./pages/Report";
import DossierEspejo from "./pages/DossierEspejo";
import SesionValidacion from "./pages/SesionValidacion";
import ReservarPrograma from "./pages/ReservarPrograma";
import Method from "./pages/Method";
import Treatments from "./pages/Treatments";
import MethodDetails from "./pages/MethodDetails";
import AnxietyManagement from "./pages/AnxietyManagement";
import Ansiedad from "./pages/Ansiedad";
import Estres from "./pages/Estres";
import Insomnio from "./pages/Insomnio";
import Procrastinacion from "./pages/Procrastinacion";
import RumiacionMental from "./pages/RumiacionMental";
import GestionEmocional from "./pages/GestionEmocional";
import AlimentacionEmocional from "./pages/AlimentacionEmocional";
import EmotionDiary from "./pages/EmotionDiary";
import WeeklyGoals from "./pages/WeeklyGoals";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AiDiagnostics from "./pages/AiDiagnostics";

import Resources from "./pages/Resources";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="tratamientos-online" element={<Treatments />} />
          <Route path="method" element={<Method />} />
          <Route path="como-trabajamos" element={<Method />} />
          <Route path="method-details" element={<MethodDetails />} />
          <Route path="como-trabajamos/detalles" element={<MethodDetails />} />
          <Route path="anxiety" element={<AnxietyManagement />} />
          <Route path="ansiedad" element={<Ansiedad />} />
          <Route path="estres" element={<Estres />} />
          <Route path="insomnio" element={<Insomnio />} />
          <Route path="procrastinacion" element={<Procrastinacion />} />
          <Route path="pensar-demasiado-rumiacion" element={<RumiacionMental />} />
          <Route path="gestion-emocional" element={<GestionEmocional />} />
          <Route path="alimentacion-emocional" element={<AlimentacionEmocional />} />
          <Route path="emotion-diary" element={
            <ProtectedRoute>
              <EmotionDiary />
            </ProtectedRoute>
          } />
          <Route path="weekly-goals" element={
            <ProtectedRoute>
              <WeeklyGoals />
            </ProtectedRoute>
          } />
          <Route path="login" element={<Login />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cookies" element={<Cookies />} />
          <Route path="terms" element={<Terms />} />
          <Route path="session" element={
            <ProtectedRoute>
              <Session />
            </ProtectedRoute>
          } />
          <Route path="session-ended" element={
            <ProtectedRoute>
              <SessionEnded />
            </ProtectedRoute>
          } />
          <Route path="report" element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } />
          <Route path="dossier-espejo" element={
            <ProtectedRoute>
              <DossierEspejo />
            </ProtectedRoute>
          } />
          <Route path="reservar-programa" element={
            <ProtectedRoute>
              <ReservarPrograma />
            </ProtectedRoute>
          } />
          <Route path="sesion-validacion" element={
            <ProtectedRoute>
              <SesionValidacion />
            </ProtectedRoute>
          } />
          <Route path="resources" element={<Resources />} />
          <Route path="herramientas" element={<Resources />} />
          <Route path="ai-diagnostics" element={
            <ProtectedRoute>
              <AiDiagnostics />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
