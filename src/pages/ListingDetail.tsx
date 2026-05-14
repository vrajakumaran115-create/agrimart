import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").eq("id", Number(id)).single();
    if (error) {
      console.error("Product load failed", error.message);
    } else {
      setProduct(data as Product);
    }
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product || quantity < 1) return;
    addToCart(product, quantity);
    setMessage("Product added to cart.");
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-600">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-slate-600">
        Product not found.
        <div className="mt-6">
          <Link to="/" className="text-green-600 font-semibold hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <img
          src={product.image || "https://picsum.photos/seed/agrimart/900/700"}
          alt={product.name}
          className="h-[520px] w-full rounded-[2rem] object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-green-600 font-black">Fresh item</p>
            <h1 className="text-4xl font-extrabold text-slate-900">{product.name}</h1>
            <p className="text-lg leading-8 text-slate-600">{product.description}</p>
          </div>
          <div className="flex items-center gap-6 text-slate-700">
            <span className="text-3xl font-black text-green-600">₹{product.price.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <aside className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="rounded-3xl bg-slate-50 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Order summary</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">₹{product.price.toFixed(0)}</p>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Quantity
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </label>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-3xl bg-green-600 px-5 py-4 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          Add to cart
        </button>

        {message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}

        <Link to="/checkout" className="block text-center text-sm font-semibold text-green-700 hover:underline">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
