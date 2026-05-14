import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, ShieldCheck, LogOut, LogIn, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 text-slate-900 font-extrabold text-xl tracking-tight">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span>Agrimart</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-slate-600 hover:text-green-600 transition">Home</Link>
          <Link to="/checkout" className="text-slate-600 hover:text-green-600 transition">Checkout</Link>
          {isAdmin && <Link to="/admin" className="text-slate-600 hover:text-green-600 transition">Admin</Link>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/checkout" className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {totalItems > 0 && <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">{totalItems}</span>}
          </Link>
          {user ? (
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
              <LogIn className="h-4 w-4" />
              Admin login
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-green-600 transition">Home</Link>
            <Link to="/checkout" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-green-600 transition">Checkout</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-green-600 transition">Admin</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700 font-semibold hover:bg-slate-100 transition">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 transition">
                <LogIn className="h-4 w-4" /> Admin login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
