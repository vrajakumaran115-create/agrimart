import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Lock, Phone, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    role: "buyer"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 p-4 rounded-2xl mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Join AgriMarket</h1>
          <p className="text-neutral-500 mt-2">Connect with buyers and sellers in your community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                name="name"
                type="text" 
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                name="email"
                type="email" 
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                name="phone"
                type="tel" 
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                name="location"
                type="text" 
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                name="password"
                type="password" 
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700 ml-1">Account Role</label>
            <select 
              name="role"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-400/20 focus:border-green-500 transition-all outline-none appearance-none"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="buyer">Buyer (Customer)</option>
              <option value="seller">Seller (Farmer)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="md:col-span-2 mt-4 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-neutral-500 font-medium">
          Already have an account? <Link to="/login" className="text-green-600 hover:underline">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
