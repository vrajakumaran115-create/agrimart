import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Users, ShoppingBag, Trash2, ShieldCheck, Mail, Phone, MapPin, Loader2, AlertCircle, Eye, CheckCircle2, IndianRupee, Clock, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalListings: number;
  freeListings: number;
  paidListings: number;
  pendingListings: number;
  totalRevenue: number;
}

interface Listing {
  id: number;
  title: string;
  category_name: string;
  price: number;
  payment_status: string;
  seller_name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"listings" | "users">("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listingsRes, statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/listings", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      const listingsData = await listingsRes.json();
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      
      setListings(listingsData);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateListingStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteListing = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user? All their listings will be removed.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" /></div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-green-600" /> Admin Dashboard
        </h1>
        <p className="text-neutral-500 font-medium">Manage marketplace activity and financial overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab("users")}
          className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
            activeTab === "users" ? "bg-green-600 text-white shadow-xl shadow-green-100" : "bg-white border-neutral-100 shadow-xl shadow-neutral-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${activeTab === "users" ? "bg-green-500 text-white" : "bg-green-100 text-green-600"}`}><Users className="w-6 h-6" /></div>
            <div className="text-4xl font-black">{stats?.totalUsers || 0}</div>
          </div>
          <div className={`mt-4 font-black uppercase text-[10px] tracking-widest ${activeTab === "users" ? "text-green-100" : "text-neutral-400"}`}>Total Users</div>
        </div>

        <div 
          onClick={() => setActiveTab("listings")}
          className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] ${
            activeTab === "listings" ? "bg-green-600 text-white shadow-xl shadow-green-100" : "bg-white border-neutral-100 shadow-xl shadow-neutral-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${activeTab === "listings" ? "bg-green-500 text-white" : "bg-blue-100 text-blue-600"}`}><ShoppingBag className="w-6 h-6" /></div>
            <div className="text-4xl font-black">{stats?.totalListings || 0}</div>
          </div>
          <div className={`mt-4 font-black uppercase text-[10px] tracking-widest ${activeTab === "listings" ? "text-green-100" : "text-neutral-400"}`}>Total Listings</div>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl text-green-900 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-green-500 p-3 rounded-2xl text-white"><IndianRupee className="w-6 h-6" /></div>
            <div className="text-4xl font-black">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
          </div>
          <div className="mt-4 font-black uppercase text-[10px] tracking-widest text-green-700">Total Revenue</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 flex flex-col justify-between hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-yellow-400 p-3 rounded-2xl text-white"><Clock className="w-6 h-6" /></div>
            <div className="text-4xl font-black text-yellow-900">{stats?.pendingListings || 0}</div>
          </div>
          <div className="mt-4 font-black uppercase text-[10px] tracking-widest text-yellow-700">Pending Payments</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight capitalize">
            {activeTab} Management
          </h2>
          {activeTab === "listings" && (
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Paid: {stats?.paidListings}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Info className="w-3 h-3" /> Free: {stats?.freeListings}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            {activeTab === "listings" ? (
              <motion.table 
                key="listings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Item Details</th>
                    <th className="px-8 py-4">Seller</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-neutral-900">{l.title}</div>
                        <div className="text-xs text-neutral-400 font-medium">₹{l.price.toLocaleString()} • {new Date(l.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-neutral-700">{l.seller_name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          {l.category_name}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          {l.payment_status === "paid" && (
                            <span className="text-green-600 text-xs font-black uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          )}
                          {l.payment_status === "free" && (
                            <span className="text-blue-600 text-xs font-black uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Free Listing
                            </span>
                          )}
                          {l.payment_status === "pending" && (
                            <span className="text-yellow-600 text-xs font-black uppercase flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Awaiting Payment
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/listings/${l.id}`}
                            className="p-2 bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-all"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {l.payment_status === "pending" && (
                            <button 
                              onClick={() => updateListingStatus(l.id, "paid")}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all font-bold text-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Verify
                            </button>
                          )}
                          <button 
                            onClick={() => deleteListing(l.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              <motion.table 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-left"
              >
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">User Details</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Location</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-black text-green-700">
                            {u.name[0]}
                          </div>
                          <div>
                            <div className="font-black text-neutral-900">{u.name}</div>
                            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{new Date(u.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600"><Mail className="w-3 h-3" /> {u.email}</div>
                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600"><Phone className="w-3 h-3" /> {u.phone}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 text-xs font-medium text-neutral-600">
                          <MapPin className="w-3 h-3 text-neutral-400" /> {u.location}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {u.id !== user?.id && (
                          <button 
                            onClick={() => deleteUser(u.id)}
                            className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
