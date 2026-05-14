import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, User, Calendar, Phone, MessageSquare, Trash2, Edit, ChevronLeft, ArrowRight, ShoppingBag, Film, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";

interface ListingDetail {
  id: number;
  title: string;
  category_name: string;
  breed: string | null;
  age: string | null;
  price: number;
  location: string;
  description: string | null;
  images: string[] | string | null;
  video: string | null;
  category_data: any;
  seller_id: number;
  seller_name: string;
  seller_phone: string;
  seller_location: string;
  created_at: string;
}

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [isShowingVideo, setIsShowingVideo] = useState(false);
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();
      if (res.ok) {
        setListing(data);
        const imgs = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
        if (Array.isArray(imgs) && imgs.length > 0) setActiveMedia(imgs[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) navigate("/seller/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="py-20 text-center text-neutral-500 font-medium">Loading...</div>;
  if (!listing) return <div className="py-20 text-center text-neutral-500 font-medium">Listing not found</div>;

  const isOwner = user?.id === listing.seller_id;
  const isAdmin = user?.role === "admin";
  const images = typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images || []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-neutral-500 hover:text-green-600 font-medium transition-colors">
        <ChevronLeft className="w-5 h-5" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Media */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="aspect-square rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-xl shadow-neutral-200/50 relative">
            {isShowingVideo && listing.video ? (
              <video src={listing.video} controls autoPlay className="w-full h-full object-contain" />
            ) : (
              <img 
                src={activeMedia || "https://picsum.photos/seed/agri/800/800"} 
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Array.isArray(images) && images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => { setActiveMedia(img); setIsShowingVideo(false); }}
                className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeMedia === img && !isShowingVideo ? 'border-green-500 scale-105' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
            {listing.video && (
              <button 
                onClick={() => setIsShowingVideo(true)}
                className={`w-20 h-20 flex-shrink-0 rounded-xl bg-neutral-100 flex items-center justify-center border-2 transition-all ${isShowingVideo ? 'border-green-500 scale-105' : 'border-transparent'}`}
              >
                <Film className="w-8 h-8 text-green-400" />
              </button>
            )}
          </div>
          
          {(isOwner || isAdmin) && (
            <div className="flex gap-4">
              <Link 
                to={`/seller/edit-listing/${listing.id}`} 
                className="flex-grow flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-all font-sans"
              >
                <Edit className="w-5 h-5" /> {t("edit")}
              </Link>
              <button 
                onClick={handleDelete}
                className="flex-grow flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all"
              >
                <Trash2 className="w-5 h-5" /> Delete
              </button>
            </div>
          )}
        </motion.div>

        {/* Right: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {listing.category_name}
              </span>
              <span className="text-neutral-400 font-medium text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">{listing.title}</h1>
            <div className="text-4xl font-black text-green-600">₹{listing.price.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl shadow-neutral-200/20 space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pb-8 border-b border-neutral-100">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{t("location")}</span>
                <div className="flex items-center gap-1 font-bold text-neutral-900">
                  <MapPin className="w-4 h-4 text-green-500" /> {listing.location}
                </div>
              </div>
              {listing.breed && (
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{t("breed")}</span>
                  <div className="font-bold text-neutral-900">{listing.breed}</div>
                </div>
              )}
              {listing.age && (
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{t("age")}</span>
                  <div className="font-bold text-neutral-900">{listing.age}</div>
                </div>
              )}
            </div>

            {/* Dynamic Category Data */}
            {listing.category_data && Object.keys(listing.category_data).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <Info className="w-3 h-3 text-green-500" /> Category Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(listing.category_data).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-neutral-50 px-4 py-2 rounded-xl flex flex-col">
                      <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                      <span className="font-bold text-neutral-700">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-black text-neutral-900 flex items-center gap-2 uppercase text-xs tracking-widest"><ShoppingBag className="w-4 h-4 text-green-600" /> {t("description")}</h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line tracking-tight font-medium">
                {listing.description || t("no_description")}
              </p>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white text-neutral-900 rounded-3xl p-8 space-y-6 shadow-2xl shadow-neutral-200/40 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-green-400" /> Seller Information
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl font-black text-green-700 border border-green-100">
                  {listing.seller_name[0]}
                </div>
                <div>
                  <div className="font-bold text-xl">{listing.seller_name}</div>
                  <div className="text-neutral-400 flex items-center gap-1 text-sm font-medium">
                    <MapPin className="w-3 h-3" /> {listing.seller_location || listing.location}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href={`tel:${listing.seller_phone}`}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" /> Call Seller
                </a>
                <a 
                  href={`https://wa.me/${listing.seller_phone.replace(/\D/g,'')}?text=Hi, I am interested in your listing: ${listing.title}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

