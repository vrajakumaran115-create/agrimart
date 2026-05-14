import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Plus, Edit, Trash2, LayoutDashboard, ShoppingBag, MapPin, Eye, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface Listing {
  id: number;
  title: string;
  category_name: string;
  price: number;
  location: string;
  images: string[] | string | null;
  payment_status: string;
  created_at: string;
}

export default function SellerDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/login");
      return;
    }
    fetchMyListings();
  }, [user]);

  const fetchMyListings = async () => {
    try {
      const res = await fetch("/api/seller/listings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setListings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchMyListings();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" /></div>;

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Floating Action Button */}
      <Link 
        to="/seller/add-listing"
        className="fixed bottom-10 right-10 z-[100] bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-green-400/40 hover:scale-110 active:scale-95 transition-all group"
        title={t("add_listing")}
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </Link>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg"
        >
          <CheckCircle2 className="w-6 h-6" />
          <p className="font-bold">{successMessage}</p>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-green-600" /> {t("seller_dashboard")}
          </h1>
          <p className="text-neutral-500 font-medium">Manage your products and livestock in one place</p>
        </div>
        <Link 
          to="/seller/add-listing" 
          className="hidden sm:flex bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" /> {t("add_listing")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-100 space-y-4">
          <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-4xl font-black text-neutral-900">{listings.length}</div>
            <div className="text-neutral-500 font-bold text-sm tracking-widest uppercase">Active Listings</div>
          </div>
        </div>
        
        <div className="bg-green-50 p-8 rounded-3xl text-green-900 space-y-4 relative overflow-hidden">
          <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <div className="text-xl font-bold">Quick Tips</div>
            <p className="text-green-700 text-sm mt-1">High quality photos with clear lighting increase sales by 40%.</p>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-green-500/20 blur-3xl -mb-12 -mr-12"></div>
        </div>

        <div className="bg-green-50 p-8 rounded-3xl border border-green-100 space-y-4">
          <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-900 truncate">{user?.location}</div>
            <div className="text-green-700 font-bold text-sm tracking-widest uppercase">Business Location</div>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900">Your Current Inventory</h2>
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => {
              let imageSrc = "https://picsum.photos/seed/agri/600/400";
              if (listing.images) {
                try {
                  const imgs = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
                  if (imgs.length > 0) imageSrc = imgs[0];
                } catch (e) {}
              }

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={listing.id} 
                  className="bg-white rounded-3xl border border-neutral-100 hover:border-green-200 transition-all overflow-hidden flex flex-col group"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={imageSrc} 
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-black text-green-700 shadow-sm uppercase tracking-widest">
                      {listing.category_name}
                    </div>
                    {listing.payment_status === "pending" && (
                      <div className="absolute inset-0 bg-white/90 text-neutral-900 flex items-center justify-center p-4">
                        <Link 
                          to={`/seller/payment/${listing.id}`}
                          className="bg-yellow-400 text-neutral-900 px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider hover:bg-yellow-500 transition-all animate-pulse"
                        >
                          {t("payment_required")}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4 flex-grow">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-neutral-900 leading-tight">{listing.title}</h3>
                      <div className="text-2xl font-black text-green-600">₹{listing.price.toLocaleString()}</div>
                      <div className="flex items-center gap-1 text-neutral-400 text-sm">
                        <MapPin className="w-3 h-3" /> {listing.location}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link 
                        to={`/listings/${listing.id}`}
                        className="flex-grow flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-all text-sm"
                      >
                        <Eye className="w-4 h-4" /> {t("view")}
                      </Link>
                      <Link 
                        to={`/seller/edit-listing/${listing.id}`}
                        className="flex-grow flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl font-bold hover:bg-green-100 transition-all text-sm"
                      >
                        <Edit className="w-4 h-4" /> {t("edit")}
                      </Link>
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        className="flex items-center justify-center bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-neutral-100 text-center space-y-6">
            <div className="bg-neutral-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-800 tracking-tight">You haven't listed anything yet</h3>
              <p className="text-neutral-500 max-w-sm mx-auto">Start selling goats, poultry, or fresh produce today and reach millions of buyers.</p>
            </div>
            <Link 
              to="/seller/add-listing" 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
            >
              <Plus className="w-6 h-6" /> {t("add_listing")}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
