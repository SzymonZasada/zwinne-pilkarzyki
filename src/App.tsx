import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Import pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected route component
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log("ProtectedRoute -", {
    user,
    loading,
    isAuthenticated,
    accessToken: localStorage.getItem("accessToken"),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Sprawdzamy zarówno user jak i token w localStorage - podwójne zabezpieczenie
  const accessToken = localStorage.getItem("accessToken");

  if (!user && !accessToken) {
    console.log("No user or token, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

// Oddzielny komponent dla routingu, aby uniknąć problemów z renderowaniem
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected dashboard route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect to login if no route matches */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("App initialization - Token exists:", !!token);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Dodajemy import useEffect
import { useEffect } from "react";

export default App;
