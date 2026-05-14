import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, Tag, ArrowRight, ShoppingBasket, Phone, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";

interface Listing {
  id: number;
  title: string;
  category_name: string;
  price: number;
  location: string;
  images: string | string[];
  seller_name: string;
  seller_phone: string;
}

interface Category {
  id: string;
  name: string;
  tKey: string;
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { user } = useAuth();

  const categories: Category[] = [
    { id: "animals", name: "Home Animals", tKey: "home_animals" },
    { id: "birds", name: "Home Birds", tKey: "home_birds" },
    { id: "feed", name: "Theevanam", tKey: "theevanam" },
    { id: "tools", name: "Tools / Equipment", tKey: "tools" },
  ];

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      let url = "/api/listings";
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      
      const res = await fetch(`${url}?${params.toString()}`);
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const contactSeller = (phone: string, title: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I saw your listing "${title}" on AgriMarket and I am interested.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-8">
        <div className="space-y-1">
          <div className="text-green-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <ShoppingBasket className="w-4 h-4" /> {t("welcome")}
          </div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">{t("listings")}</h1>
          <p className="text-neutral-500 font-medium">{t("connecting")}</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={t("search")} 
              className="w-full bg-white border border-neutral-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-green-400/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 text-sm">
            Find
          </button>
        </form>
      </div>

      {/* Category Navigation Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory("")}
          className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border ${
            selectedCategory === "" 
              ? "bg-green-600 border-green-600 text-white shadow-xl shadow-green-200" 
              : "bg-white border-neutral-200 text-neutral-600 hover:border-green-300 shadow-sm"
          }`}
        >
          {t("all_categories")}
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border ${
              selectedCategory === cat.id 
                ? "bg-green-600 border-green-600 text-white shadow-xl shadow-green-200" 
                : "bg-white border-neutral-200 text-neutral-600 hover:border-green-300 shadow-sm"
          }`}
          >
            {t(cat.tKey)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 space-y-4 animate-pulse border border-neutral-100">
                <div className="w-full aspect-square bg-neutral-100 rounded-2xl" />
                <div className="h-6 bg-neutral-100 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {listings.map((listing) => {
                let displayImage = "https://picsum.photos/seed/agri/400/400";
                if (listing.images) {
                  try {
                    const imgs = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
                    if (Array.isArray(imgs) && imgs.length > 0) displayImage = imgs[0];
                  } catch (e) {}
                }

                return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={listing.id} 
                  className="bg-white rounded-3xl p-4 border border-neutral-100 hover:border-green-200 transition-all hover:shadow-2xl hover:shadow-neutral-200/50 flex flex-col group"
                >
                  <Link to={`/listings/${listing.id}`} className="block relative aspect-square overflow-hidden rounded-2xl bg-neutral-50 mb-4">
                    <img 
                      src={displayImage} 
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-green-700 shadow-sm uppercase tracking-widest border border-green-50">
                      {listing.category_name}
                    </div>
                  </Link>

                  <div className="space-y-4 flex-grow flex flex-col">
                    <div className="space-y-1">
                      <Link to={`/listings/${listing.id}`} className="block">
                        <h3 className="font-bold text-neutral-900 line-clamp-1 group-hover:text-green-600 transition-colors text-lg tracking-tight">{listing.title}</h3>
                      </Link>
                      <div className="flex items-center gap-1 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                        <MapPin className="w-3 h-3" /> {listing.location}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-neutral-50">
                      <div className="text-2xl font-black text-neutral-900 mb-4">₹{listing.price.toLocaleString()}</div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/listings/${listing.id}`}
                          className="flex-grow flex items-center justify-center gap-2 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 py-3 rounded-xl font-bold transition-all border border-neutral-200 text-sm"
                        >
                          Details
                        </Link>
                        <button 
                          onClick={() => contactSeller(listing.seller_phone, listing.title)}
                          className="flex-grow flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-200 text-sm"
                        >
                          <MessageSquare className="w-4 h-4" /> {user?.role === 'seller' ? 'Chat' : 'Message'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <div className="bg-neutral-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto scale-110">
              <Filter className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">End of the road</h3>
              <p className="text-neutral-500 max-w-sm mx-auto font-medium">No results found for this search. Try exploring other categories or clearing your filters.</p>
            </div>
            <button 
              onClick={() => { setSelectedCategory(""); setSearchTerm(""); fetchListings(); }}
              className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 hover:scale-105 transition-all active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
