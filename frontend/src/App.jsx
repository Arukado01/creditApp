// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import PublicRoute from "./auth/PublicRoute";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import CreditsList from "./pages/CreditsList";
import Register from "./pages/Register";
import Forgot from "./pages/ForgotPassword";
import Reset from "./pages/ResetPassword";

function AppContent() {
  // Ahora sí estamos dentro de <AuthProvider>, así que el hook funciona
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {/* Sidebar solo si hay usuario */}
      {user && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      )}

      <div className={`${user ? "md:ml-56" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/credits" replace />
              </PrivateRoute>
            }
          />

          {/* rutas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot"
            element={
              <PublicRoute>
                <Forgot />
              </PublicRoute>
            }
          />

          <Route
            path="/reset/:token"
            element={
              <PublicRoute>
                <Reset />
              </PublicRoute>
            }
          />

          {/* rutas protegidas */}
          <Route
            path="/credits"
            element={
              <PrivateRoute>
                <CreditsList />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
