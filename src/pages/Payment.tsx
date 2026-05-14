import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { IndianRupee, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { LISTING_PRICE } from "../../constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Listing not found");
      setListing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      // 1. Create order on backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ listing_id: id })
      });

      const orderData = await res.json();
      if (!res.ok) {
        if (orderData.isConfigError) {
          setError("Razorpay is not configured on the server. Please add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the settings.");
        } else {
          throw new Error(orderData.message || "Failed to create order");
        }
        setIsProcessing(false);
        return;
      }

      // 2. Open Razorpay Checkout
      if (!window.Razorpay) {
        setError("Razorpay SDK not loaded. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AgriMart",
        description: "Listing Fee",
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                listing_id: id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              navigate("/seller/dashboard", { state: { message: "Payment successful! Your listing is now live." } });
            } else {
              setError("Payment verification failed");
            }
          } catch (err) {
            setError("Error verifying payment");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#16a34a"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden"
      >
        <div className="bg-green-600 p-8 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black">Listing Payment</h1>
          <p className="text-green-100 font-medium mt-1">First 3 listings were free. This listing requires a small fee.</p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <div className="bg-neutral-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Item</span>
              <span className="font-black text-neutral-900">{listing?.title}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-neutral-200 pt-4">
              <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Amount</span>
              <span className="font-black text-2xl text-green-600">₹{LISTING_PRICE / 100}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl">
              <ShieldCheck className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Secure Payment</p>
                <p className="text-xs">Your payment is processed securely via Razorpay.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Pay ₹{LISTING_PRICE/100} Now</>}
            </button>

            <button
              onClick={() => navigate("/seller/dashboard")}
              disabled={isProcessing}
              className="w-full text-neutral-400 font-bold py-2 hover:text-neutral-600 transition-colors"
            >
              Pay Later
            </button>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 text-center">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            Payment handled by Razorpay Integration
          </p>
        </div>
      </motion.div>
    </div>
  );
}
