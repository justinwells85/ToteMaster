import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import TotesPage from './pages/TotesPage';
import ToteDetail from './pages/ToteDetail';
import ItemsPage from './pages/ItemsPage';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/totes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TotesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/totes/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ToteDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ItemsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ItemDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
