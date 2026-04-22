import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
import LoadingSpinner from "@components/LoadingSpinner";
import ProtectedRoute from "@components/ProtectedRoute";
import { useAuth } from "@context/AuthContext";

// Lazy-loaded pages for code splitting
const Landing = lazy(() => import("@pages/Landing"));
const Chat = lazy(() => import("@pages/Chat"));
const Timeline = lazy(() => import("@pages/Timeline"));
const Dashboard = lazy(() => import("@pages/Dashboard"));
const Admin = lazy(() => import("@pages/Admin"));
const EligibilityChecker = lazy(() => import("@pages/EligibilityChecker"));
const MockVoting = lazy(() => import("@pages/MockVoting"));
const NotFound = lazy(() => import("@pages/NotFound"));

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" role="main">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/eligibility" element={<EligibilityChecker />} />
            <Route path="/mock-voting" element={<MockVoting />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
