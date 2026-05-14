import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const hasItems = cartItems.length > 0;

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasItems) return;

    setSubmitting(true);
    setMessage("");

    const orders = cartItems.map((item) => ({
      customer_name: name,
      phone,
      address,
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const { error } = await supabase.from("orders").insert(orders);
    setSubmitting(false);

    if (error) {
      setMessage("Unable to place order. Please try again.");
      return;
    }

    clearCart();
    setMessage("Order placed successfully! We will contact you soon.");
    setName("");
    setPhone("");
    setAddress("");

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10 px-4 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-green-600 font-black">Secure Checkout</p>
          <h1 className="text-4xl font-extrabold text-neutral-900">Complete your purchase</h1>
        </div>
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-neutral-100">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Order details</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                    <img
                      src={item.product.image || "https://picsum.photos/seed/agrimart/120/120"}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-3xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900">{item.product.name}</h3>
                      <p className="text-sm text-neutral-500">Qty {item.quantity}</p>
                    </div>
                    <div className="font-black text-neutral-900">₹{(item.product.price * item.quantity).toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="rounded-3xl bg-white p-8 shadow-sm border border-neutral-100 space-y-6">
              <h2 className="text-2xl font-bold text-neutral-900">Shipping information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="Your name"
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-neutral-700">
                  Phone number
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    placeholder="Mobile number"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-semibold text-neutral-700 block">
                Delivery address
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Street, city, pin code"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-3xl bg-green-600 text-white py-4 text-sm font-bold hover:bg-green-700 transition-all disabled:cursor-not-allowed disabled:bg-green-300"
              >
                {submitting ? "Placing order..." : `Place order ₹${totalAmount.toFixed(0)}`}
              </button>

              {message && <p className="text-sm text-green-700 font-medium">{message}</p>}
            </form>
          </div>

          <aside className="rounded-3xl bg-green-600 text-white p-8 shadow-xl border border-green-500">
            <h2 className="text-2xl font-bold">Order summary</h2>
            <p className="mt-3 text-neutral-100">Quick summary of your cart before checkout.</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm uppercase tracking-[0.2em] text-green-100/90">
                <span>Items</span>
                <span>{cartItems.length} products</span>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-neutral-200 shadow-sm p-10 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-green-600 font-black mb-4">Your cart is empty</p>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Add products to checkout</h2>
          <p className="text-neutral-500 mb-8">Visit the home page and add products to your cart before placing an order.</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-3xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all">
            Browse products
          </Link>
        </div>
      )}
    </div>
  );
}
