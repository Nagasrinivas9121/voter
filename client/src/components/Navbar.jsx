import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { Vote, MessageSquare, Calendar, BarChart2, Shield, Menu, X, LogOut, User, ChevronDown } from "lucide-react";

const navLinks = [
  { path: "/timeline", label: "Timeline", icon: Calendar },
  { path: "/eligibility", label: "Eligibility", icon: Shield },
  { path: "/mock-voting", label: "Mock Vote", icon: Vote },
  { path: "/chat", label: "AI Chat", icon: MessageSquare, protected: true },
  { path: "/dashboard", label: "Dashboard", icon: BarChart2, protected: true },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, loginWithGoogle, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) navigate("/chat");
  };

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-900/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="ElectEd AI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-glow group-hover:shadow-glow transition-all duration-300">
            <Vote className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-display font-bold text-xl">
            <span className="gradient-text">ElectEd</span>
            <span className="text-white"> AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map(({ path, label, icon: Icon, protected: isProtected }) => {
            if (isProtected && !isAuthenticated) return null;
            const active = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary-600/20 text-primary-300"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=6366f1&color=fff`}
                  alt={user?.displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-sm text-slate-300 max-w-[100px] truncate">{user?.displayName}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 glass-card p-2 z-50"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white w-full"
                      role="menuitem"
                    >
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full mt-1"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="btn-primary text-sm px-5 py-2.5"
              aria-label="Sign in with Google"
            >
              Sign In with Google
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ path, label, icon: Icon, protected: isProtected }) => {
                if (isProtected && !isAuthenticated) return null;
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-primary-600/20 text-primary-300" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                );
              })}
              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="w-full btn-primary justify-center mt-3"
                >
                  Sign In with Google
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 mt-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
