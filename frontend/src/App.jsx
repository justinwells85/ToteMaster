import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Totes from './pages/Totes';
import Items from './pages/Items';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🏠 ToteMaster
        </Link>
        {isAuthenticated && (
          <>
            <div className="nav-links">
              <Link to="/totes" className="nav-link">Totes</Link>
              <Link to="/items" className="nav-link">Items</Link>
            </div>
            <div className="nav-user">
              <span className="user-name">{user?.name}</span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/totes"
                element={
                  <ProtectedRoute>
                    <Totes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items"
                element={
                  <ProtectedRoute>
                    <Items />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
