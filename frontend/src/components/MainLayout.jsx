import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Fixed Header with Scroll Shadow */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
          hasScrolled && "shadow-lg"
        )}
      >
        <div className="flex h-16 items-center gap-8 px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">
                🏠 ToteMaster
              </h1>
            </Link>
            <nav className="flex gap-6">
              <Link
                to="/totes"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/totes') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Totes
              </Link>
              <Link
                to="/items"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive('/items') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Items
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email || 'User'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
