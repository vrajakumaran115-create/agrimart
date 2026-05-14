import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Product, OrderRecord } from "../types";

interface ProductFormState {
  name: string;
  price: string;
  image: string;
  description: string;
}

const emptyForm: ProductFormState = {
  name: "",
  price: "",
  image: "",
  description: "",
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [productResponse, orderResponse] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);

    if (productResponse.error) {
      console.error(productResponse.error.message);
    } else {
      setProducts(productResponse.data || []);
    }

    if (orderResponse.error) {
      console.error(orderResponse.error.message);
    } else {
      setOrders(orderResponse.data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.name || !form.description || !form.image || !price) {
      setMessage("Please fill in every field with a valid price.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      price,
      image: form.image,
      description: form.description,
    };

    const response = editId
      ? await supabase.from("products").update(payload).eq("id", editId)
      : await supabase.from("products").insert(payload);

    if (response.error) {
      setMessage(response.error.message);
    } else {
      setMessage(editId ? "Product updated." : "Product added.");
      setForm(emptyForm);
      setEditId(null);
      fetchData();
    }

    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      description: product.description,
    });
    setMessage("");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Product removed.");
      fetchData();
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-600">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-green-600 font-black">Admin panel</p>
            <h1 className="text-4xl font-extrabold text-slate-900">Manage products and orders</h1>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
            Welcome, {user?.email}
          </div>
        </div>
      </div>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                <p className="text-sm text-slate-500">Create, edit, or delete store items.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {products.length} items
              </div>
            </div>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">₹{product.price.toFixed(0)}</p>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => handleEdit(product)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(product.id)} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Orders</h2>
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Order #{order.id}</p>
                        <p className="text-sm text-slate-500">Customer: {order.customer_name}</p>
                      </div>
                      <p className="text-sm font-semibold text-green-600">Qty {order.quantity}</p>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <span className="text-sm text-slate-500">Phone: {order.phone}</span>
                      <span className="text-sm text-slate-500">Product ID: {order.product_id}</span>
                      <span className="text-sm text-slate-500 sm:col-span-2">Address: {order.address}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  No orders yet. New customer purchases will appear here.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Add / update product</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              Product name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Fresh vegetables"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Price (₹)
              <input
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="399"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Image URL
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="https://example.com/image.jpg"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                className="mt-3 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Tell customers why they will love this product."
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-3xl bg-green-600 px-5 py-4 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                {saving ? "Saving..." : editId ? "Update product" : "Create product"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setForm(emptyForm); setMessage(""); }}
                  className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel edit
                </button>
              )}
            </div>
            {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
