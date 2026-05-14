import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon, AlertCircle, Play, Film, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Category {
  id: number;
  name: string;
}

export default function AddListing({ isEdit = false }) {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    breed: "",
    age: "",
    price: "",
    location: user?.location || "",
    description: "",
  });

  const [categoryData, setCategoryData] = useState<any>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      navigate("/");
      return;
    }
    fetchCategories();
    if (isEdit && id) {
      fetchListingData();
    }
  }, [id, isEdit, user]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchListingData = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();
      if (res.ok) {
        setFormData({
          title: data.title,
          category_id: data.category_id.toString(),
          breed: data.breed || "",
          age: data.age || "",
          price: data.price.toString(),
          location: data.location,
          description: data.description || "",
        });
        if (data.category_data) setCategoryData(data.category_data);
        if (data.images) setPreviews(Array.isArray(data.images) ? data.images : []);
        if (data.video) setVideoPreview(data.video);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    
    const newPreviews = files.map((file: File) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setError("");
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("Video size too large (max 50MB)");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    data.append("category_data", JSON.stringify(categoryData));
    
    imageFiles.forEach(file => data.append("images", file));
    if (videoFile) data.append("video", videoFile);

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/listings/${id}` : "/api/listings";

      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to save listing");

      if (resData.payment_required) {
        navigate(`/seller/payment/${resData.id}`);
      } else {
        navigate(user?.role === "admin" ? "/admin/dashboard" : "/seller/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryName = categories.find(c => c.id.toString() === formData.category_id)?.name;

  return (
    <div className="max-w-4xl mx-auto py-4 mb-20 px-4">
      <Link to={user?.role === "admin" ? "/admin/dashboard" : "/seller/dashboard"} className="inline-flex items-center gap-2 text-neutral-500 hover:text-green-600 font-bold mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> {t("seller_dashboard")}
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden"
      >
        <div className="bg-green-50 p-8 md:p-12 text-neutral-900">
          <h1 className="text-3xl font-black">{isEdit ? "Edit Listing" : t("add_listing")}</h1>
          <p className="text-neutral-600 font-medium">Be specific with details to reach more buyers.</p>
        </div>

        {error && (
          <div className="mx-8 mt-8 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          {/* Media Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Media Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Images */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-neutral-700">Images (Max 5)</label>
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, index) => (
                    <div key={index} className="aspect-square rounded-xl bg-neutral-100 relative overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById("images-input")?.click()}
                      className="aspect-square rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-all"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <input id="images-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* Video */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-neutral-700">Short Video (Max 15s)</label>
                <div 
                  className={`aspect-video rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer ${videoPreview ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'}`}
                  onClick={() => document.getElementById("video-input")?.click()}
                >
                  {videoPreview ? (
                    <video src={videoPreview} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <Film className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-neutral-400">Click to upload video</p>
                    </div>
                  )}
                  <input id="video-input" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Title</label>
              <input name="title" required className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-green-400/20 shadow-sm" value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">{t("price")} (₹)</label>
              <input name="price" type="number" required className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-green-400/20 shadow-sm text-green-600 font-bold" value={formData.price} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Category</label>
              <select name="category_id" required className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-green-400/20 shadow-sm font-bold" value={formData.category_id} onChange={handleInputChange}>
                <option value="">Select</option>
                {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">{t("location")}</label>
              <input name="location" required className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-green-400/20 shadow-sm" value={formData.location} onChange={handleInputChange} />
            </div>
          </div>

          {/* Logic for Dynamic Category Fields */}
          {selectedCategoryName === "Theevanam" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-green-50 rounded-3xl border border-green-100">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-green-700">{t("feed_type")}</label>
                <input name="feed_type" className="w-full bg-white p-3 rounded-xl border border-green-200 outline-none" value={categoryData.feed_type || ""} onChange={handleCategoryDataChange} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-green-700">{t("weight")}</label>
                <input name="weight" type="number" className="w-full bg-white p-3 rounded-xl border border-green-200 outline-none" value={categoryData.weight || ""} onChange={handleCategoryDataChange} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-green-700">{t("suitable_for")}</label>
                <select name="suitable_for" className="w-full bg-white p-3 rounded-xl border border-green-200 outline-none" value={categoryData.suitable_for || ""} onChange={handleCategoryDataChange}>
                  <option value="">Select</option>
                  <option value="cow">Cow / மாடு</option>
                  <option value="goat">Goat / ஆடு</option>
                  <option value="chicken">Chicken / கோழி</option>
                </select>
              </div>
            </motion.div>
          )}

          {selectedCategoryName === "Tools / Equipment" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-blue-700">{t("tool_name")}</label>
                <input name="tool_name" className="w-full bg-white p-3 rounded-xl border border-blue-200 outline-none" value={categoryData.tool_name || ""} onChange={handleCategoryDataChange} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-blue-700">{t("condition")}</label>
                <select name="condition" className="w-full bg-white p-3 rounded-xl border border-blue-200 outline-none font-bold" value={categoryData.condition || ""} onChange={handleCategoryDataChange}>
                  <option value="">Select</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-blue-700">{t("usage_type")}</label>
                <input name="usage_type" className="w-full bg-white p-3 rounded-xl border border-blue-200 outline-none" value={categoryData.usage_type || ""} onChange={handleCategoryDataChange} />
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-neutral-400">{t("description")}</label>
            <textarea name="description" rows={4} className="w-full bg-neutral-50 border border-neutral-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-green-400/20 shadow-sm resize-none" value={formData.description} onChange={handleInputChange}></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-grow bg-green-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> {isEdit ? "Save Changes" : t("submit")}</>}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="bg-neutral-100 text-neutral-700 py-5 px-10 rounded-2xl font-bold hover:bg-neutral-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
