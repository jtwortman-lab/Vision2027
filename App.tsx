import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";

// Lazy load all pages for better initial load performance
const FirmDashboard = lazy(() => import("@/pages/FirmDashboard"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AdvisorDashboard = lazy(() => import("@/pages/AdvisorDashboard"));
const MyClients = lazy(() => import("@/pages/MyClients"));
const ClientNetWorth = lazy(() => import("@/pages/ClientNetWorth"));
const ProspectIntake = lazy(() => import("@/pages/ProspectIntake"));
const MatchResults = lazy(() => import("@/pages/MatchResults"));
const AdvisorBook = lazy(() => import("@/pages/AdvisorBook"));
const AdvisorDetail = lazy(() => import("@/pages/AdvisorDetail"));
const ClientReview = lazy(() => import("@/pages/ClientReview"));
const AdminTaxonomy = lazy(() => import("@/pages/AdminTaxonomy"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const AuditLog = lazy(() => import("@/pages/AuditLog"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/firm"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <FirmDashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advisor-dashboard/:advisorId?"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdvisorDashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-clients"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <MyClients />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-clients/:clientId"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ClientNetWorth />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/intake"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProspectIntake />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <MatchResults />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advisors"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdvisorBook />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/advisors/:advisorId"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdvisorDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ClientReview />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/taxonomy"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdminTaxonomy />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Analytics />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AuditLog />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
