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
import Method from "./pages/Method";
import MethodDetails from "./pages/MethodDetails";
import AnxietyManagement from "./pages/AnxietyManagement";
import Zen from "./pages/Zen";
import EmotionDiary from "./pages/EmotionDiary";
import WeeklyGoals from "./pages/WeeklyGoals";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="method" element={<Method />} />
          <Route path="method-details" element={<MethodDetails />} />
          <Route path="anxiety" element={<AnxietyManagement />} />
          <Route path="zen" element={<Zen />} />
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
          <Route path="resources" element={<div className="min-h-[80vh] flex items-center justify-center font-headline text-3xl text-primary font-light">Sección de Recursos en desarrollo...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
