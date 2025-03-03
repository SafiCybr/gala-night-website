
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-spring",
        isScrolled
          ? "py-3 bg-white/80 backdrop-blur-md shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          EventRegistry
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="link-hover font-medium">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="link-hover font-medium">
                Dashboard
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="link-hover font-medium">
                  Admin Panel
                </Link>
              )}
              
              <Button variant="ghost" onClick={logout} className="font-medium">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-medium">Register</Button>
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md animate-slide-down">
          <div className="container py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="justify-start font-normal"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="py-2 px-4 hover:bg-muted rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
