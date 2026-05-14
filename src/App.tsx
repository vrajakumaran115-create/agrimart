/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import WelcomePopup from "./components/WelcomePopup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SellerDashboard from "./pages/SellerDashboard";
import AddListing from "./pages/AddListing";
import ListingDetail from "./pages/ListingDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Marketplace from "./pages/Marketplace";
import Payment from "./pages/Payment";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
        <WelcomePopup />
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/add-listing" element={<AddListing />} />
              <Route path="/seller/edit-listing/:id" element={<AddListing isEdit />} />
              <Route path="/seller/payment/:id" element={<Payment />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-neutral-200 py-8 text-center text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} Agri Marketplace. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

