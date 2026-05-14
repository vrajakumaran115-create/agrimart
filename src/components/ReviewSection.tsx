import React, { useState, useEffect } from "react";
import { Star, MessageSquare, User, Loader2, Send, AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const { t } = useLanguage();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      if (rating === 0) {
        setMessage({ type: "error", text: "Please select a star rating." });
        setIsSubmitting(false);
        return;
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: name, rating, comment }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Thank you for your feedback!" });
        setName("");
        setComment("");
        setRating(0);
        fetchReviews();
      } else {
        setMessage({ type: "error", text: "Failed to submit review. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight">{t("reviews_title")}</h2>
        <p className="text-neutral-500 font-medium">Real experiences from farmers and buyers worldwide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Submission Form */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl shadow-neutral-200/50 space-y-6 sticky top-24">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-neutral-900">{t("share_story")}</h3>
              <p className="text-sm text-neutral-500 font-medium">{t("how_experience")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest">{t("your_name")}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your name"
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-400/10 outline-none font-medium transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest">{t("rating")}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-all ${(hoverRating || rating) >= star ? "text-yellow-400 scale-110" : "text-neutral-200"}`}
                    >
                      <Star className={`w-8 h-8 ${(hoverRating || rating) >= star ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest">{t("your_experience")}</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Write your review here..."
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-3 px-4 focus:ring-4 focus:ring-green-400/10 outline-none font-medium transition-all resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
                      message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {message.type === "success" ? <Send className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t("submit_review")}</>}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-neutral-50 h-48 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((r) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  key={r.id} 
                  className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold group-hover:bg-green-600 group-hover:text-white transition-colors">
                      {r.user_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900">{r.user_name}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-current" : "text-neutral-200"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-600 font-medium italic leading-relaxed line-clamp-4">
                    "{r.comment}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-3xl p-12 text-center space-y-4">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-900">No reviews yet</h3>
              <p className="text-neutral-500 font-medium max-w-xs mx-auto">Be the first to share your experience with our growing community!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
