import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ShoppingBasket, User, LogOut, Menu, X, LayoutDashboard, PlusCircle, ShieldCheck, Languages } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    ...(user?.role === "seller" ? [
      { name: t("seller_dashboard"), path: "/seller/dashboard", icon: LayoutDashboard },
    ] : []),
    ...(user?.role === "admin" ? [
      { name: t("admin_dashboard"), path: "/admin/dashboard", icon: ShieldCheck }
    ] : []),
  ];

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-green-600 font-bold text-xl uppercase tracking-tighter">
          <ShoppingBasket className="w-8 h-8" />
          <span className="hidden sm:inline">AgriMarket</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="text-neutral-600 hover:text-green-600 transition-colors font-medium">
              {link.name}
            </Link>
          ))}
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-black text-neutral-600 hover:bg-neutral-100 transition-all uppercase tracking-widest"
          >
            <Languages className="w-3.5 h-3.5" />
            {language === "en" ? "தமிழ்" : "English"}
          </button>

          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm text-neutral-500 flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full">
                <User className="w-4 h-4" /> {user.name}
              </span>
              <button 
                onClick={handleLogout}
                className="text-neutral-400 hover:text-red-500 transition-colors p-2"
                title={t("logout")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-neutral-600 hover:text-green-600 font-medium">{t("login")}</Link>
              <Link to="/register" className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-colors font-medium shadow-md shadow-green-100">{t("register")}</Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="p-2 text-neutral-600 bg-neutral-50 rounded-xl"
          >
            <Languages className="w-5 h-5" />
          </button>
          <button className="p-2 text-neutral-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ translateY: -20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: -20, opacity: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden shadow-xl"
          >
            <div className="p-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-neutral-600 hover:text-green-600 font-bold flex items-center gap-3 text-lg"
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.name}
                </Link>
              ))}
              <hr className="border-neutral-100" />
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-neutral-500 font-medium bg-neutral-50 p-4 rounded-2xl">
                    <div className="text-xs uppercase font-black tracking-widest text-neutral-400 mb-1">Logged in as</div>
                    <div className="text-neutral-900 font-bold">{user.name} ({user.role})</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 font-bold p-2"
                  >
                    <LogOut className="w-5 h-5" /> {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-neutral-600 font-bold text-center p-3 border border-neutral-100 rounded-xl">{t("login")}</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 font-bold shadow-lg shadow-green-100">{t("register")}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
