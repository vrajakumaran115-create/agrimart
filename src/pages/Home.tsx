import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, Tag, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import ReviewSection from "../components/ReviewSection";
import { useLanguage } from "../context/LanguageContext";

interface Listing {
  id: number;
  title: string;
  category_name: string;
  price: number;
  location: string;
  image: string | null;
  seller_name: string;
  seller_phone: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const categories: Category[] = [
    { id: "animals", name: "Home Animals" },
    { id: "birds", name: "Home Birds" },
    { id: "feed", name: "Theevanam" },
    { id: "tools", name: "Tools / Equipment" },
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
      
      const fetchUrl = `${url}?${params.toString()}`;
      const res = await fetch(fetchUrl);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch failed:", res.status, errorText);
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <section className="bg-green-600 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {t("listings")}
          </h1>
          <p className="text-green-100 text-lg">
            {t("connecting")}
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={t("search")} 
                className="w-full bg-white text-neutral-900 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-green-400/50 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all text-sm shadow-lg shadow-green-200">
              Search
            </button>
          </form>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 hidden lg:block">
          <ShoppingBasket className="w-80 h-80 -mb-20 -mr-20" />
        </div>
      </section>

      {/* Category Filter */}
      <section className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory("")}
          className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
            selectedCategory === "" 
              ? "bg-green-600 text-white shadow-md shadow-green-200" 
              : "bg-white text-neutral-600 border border-neutral-200 hover:border-green-300"
          }`}
        >
          {t("all_categories")}
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id.toString())}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === cat.id.toString() 
                ? "bg-green-600 text-white shadow-md shadow-green-200" 
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-green-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </section>

      {/* Listings Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-green-600" />
            Recently Added
          </h2>
          <span className="text-neutral-500 text-sm font-medium">{listings.length} items found</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="w-full aspect-square bg-neutral-100 rounded-xl" />
                <div className="h-6 bg-neutral-100 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => {
              let imageSrc = "https://picsum.photos/seed/agri/400/400";
              if (listing.images) {
                try {
                  const imgs = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
                  if (Array.isArray(imgs) && imgs.length > 0) imageSrc = imgs[0];
                } catch (e) {}
              }

              return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={listing.id} 
                className="group bg-white rounded-2xl p-3 border border-neutral-100 hover:border-green-200 transition-all hover:shadow-xl hover:shadow-neutral-200/50 flex flex-col"
              >
                <Link to={`/listings/${listing.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50 mb-4">
                    <img 
                      src={imageSrc} 
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-green-700 shadow-sm border border-green-50">
                      {listing.category_name}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-neutral-900 line-clamp-1 group-hover:text-green-600 transition-colors tracking-tight">{listing.title}</h3>
                    </div>
                    <p className="text-green-700 font-black text-xl">₹{listing.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                      <MapPin className="w-3 h-3" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </Link>
                  <div className="flex gap-2 mt-4">
                    <Link 
                      to={`/listings/${listing.id}`}
                      className="flex-grow flex items-center justify-center gap-2 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 py-3 rounded-xl font-bold transition-all border border-neutral-200 text-sm"
                    >
                      {t("view")}
                    </Link>
                    <a 
                      href={`https://wa.me/${listing.seller_phone.replace(/\D/g,'')}?text=Hi, I am interested in your listing: ${listing.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 py-3 rounded-xl font-bold transition-all shadow-md shadow-green-200 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Contact
                    </a>
                  </div>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Filter className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">No listings found</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => { setSelectedCategory(""); setSearchTerm(""); fetchListings(); }}
              className="text-green-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Reviews System */}
      <ReviewSection />
    </div>
  );
}

// Re-using icon for background
function ShoppingBasket(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m5 11 4-7" />
      <path d="m19 11-4-7" />
      <path d="M2 11h20" />
      <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
      <path d="M9 11v1" />
      <path d="M15 11v1" />
    </svg>
  );
}
