import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Funnel, ShoppingBag } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

const priceFilters = [
  { id: "all", label: "All prices" },
  { id: "under500", label: "Under ₹500" },
  { id: "500to1000", label: "₹500 - ₹1000" },
  { id: "above1000", label: "Above ₹1000" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) {
      console.error("Unable to load products", error.message);
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = [product.name, product.description].some((value) =>
        value.toLowerCase().includes(query),
      );

      if (query && !matchesSearch) {
        return false;
      }

      if (priceFilter === "under500") {
        return product.price < 500;
      }
      if (priceFilter === "500to1000") {
        return product.price >= 500 && product.price <= 1000;
      }
      if (priceFilter === "above1000") {
        return product.price > 1000;
      }
      return true;
    });
  }, [products, search, priceFilter]);

  return (
    <div className="space-y-10 pb-10">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-sky-600 p-8 text-white shadow-xl md:p-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/90">
            Fresh farm products
          </span>
          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">Agrimart — shop fresh goods from local farms.</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100/90 sm:text-lg">
            Find your favorite agricultural products, add them to cart, and checkout in a few clicks.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_200px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="w-full rounded-3xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder:text-slate-200 outline-none transition focus:border-white"
              />
            </label>
            <div className="flex items-center gap-3 rounded-3xl border border-white/20 bg-white/10 px-4 py-4">
              <Funnel className="h-5 w-5 text-white" />
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-white outline-none"
              >
                {priceFilters.map((option) => (
                  <option key={option.id} value={option.id} className="bg-slate-800 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular products</h2>
            <p className="text-sm text-slate-500">Search by name or filter by price to find what you need.</p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
            <span className="text-sm text-slate-500">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No products matched your search.</p>
            <p className="mt-3 text-sm text-slate-500">Try a different keyword or reset the filters.</p>
            <button onClick={() => { setSearch(""); setPriceFilter("all"); }} className="mt-6 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition">
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-green-600 font-black">Easy checkout</p>
            <h3 className="text-2xl font-bold text-slate-900">Finish your order in minutes</h3>
          </div>
          <Link to="/checkout" className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition">
            View cart and checkout
          </Link>
        </div>
      </section>
    </div>
  );
}
