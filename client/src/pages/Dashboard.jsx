import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { dashboardAPI, chatAPI } from "@services/api";
import { useAuth } from "@context/AuthContext";
import LoadingSpinner from "@components/LoadingSpinner";
import { MessageSquare, Calendar, Award, TrendingUp, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-6">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="font-display text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-slate-400">{label}</p>
  </div>
);

const USER_TYPE_LABELS = {
  first_time: "First-time Voter", student: "Student", general: "Citizen",
  nri: "NRI Voter", differently_abled: "Differently Abled",
};
const LANG_LABELS = { en: "English", te: "తెలుగు" };

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [sessions, setSessions] = useState([]);

  const { data: overview, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => dashboardAPI.getOverview().then((r) => r.data.data),
  });

  useQuery({
    queryKey: ["chat-sessions-dash"],
    queryFn: async () => {
      const r = await chatAPI.getSessions(1, 5);
      setSessions(r.data.data || []);
      return r.data;
    },
  });

  const handleDeleteSession = async (id) => {
    try {
      await chatAPI.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success("Chat deleted");
    } catch { toast.error("Failed to delete"); }
  };

  if (isLoading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center"><LoadingSpinner size="xl" /></div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=6366f1&color=fff`}
              alt={user?.displayName} className="w-14 h-14 rounded-2xl border-2 border-primary-500/40" />
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{user?.displayName}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-primary-600/20 text-primary-300 text-xs font-medium">{USER_TYPE_LABELS[user?.userType] || "Citizen"}</span>
            <span className="px-3 py-1 rounded-full bg-white/[0.06] text-slate-400 text-xs">🌐 {LANG_LABELS[user?.language] || "English"}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={MessageSquare} label="Total Chats" value={overview?.totalChats || 0} color="bg-gradient-to-br from-primary-600 to-indigo-600" />
          <StatCard icon={Award} label="User Type" value={USER_TYPE_LABELS[user?.userType]?.split(" ")[0] || "Citizen"} color="bg-gradient-to-br from-amber-500 to-orange-500" />
          <StatCard icon={Calendar} label="Days Active" value={Math.ceil((Date.now() - new Date(user?.createdAt || Date.now())) / 86400000)} color="bg-gradient-to-br from-emerald-500 to-teal-500" />
          <StatCard icon={TrendingUp} label="Language" value={LANG_LABELS[user?.language] || "EN"} color="bg-gradient-to-br from-rose-500 to-pink-500" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/chat", icon: "💬", label: "New Chat" },
              { to: "/timeline", icon: "📅", label: "Timeline" },
              { to: "/eligibility", icon: "✅", label: "Eligibility" },
              { to: "/mock-voting", icon: "🗳️", label: "Mock Vote" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="glass-card-hover p-4 text-center">
                <span className="text-2xl block mb-2">{a.icon}</span>
                <span className="text-sm text-slate-300">{a.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Chats</h2>
            <Link to="/chat" className="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors">
              <Plus className="w-4 h-4" /> New Chat
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-500 mb-4">No chats yet</p>
              <Link to="/chat" className="btn-primary inline-flex">Start your first chat</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s._id} className="glass-card-hover p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <p className="text-xs text-slate-500">{s.messageCount} messages · {new Date(s.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSession(s._id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    aria-label={`Delete: ${s.title}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
          <div className="glass-card p-6 space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-slate-400 mb-2">User Type</label>
              <select id="userType" value={user?.userType || "general"}
                onChange={(e) => updateProfile({ userType: e.target.value })} className="input-glass">
                <option value="first_time">First-time Voter</option>
                <option value="student">Student</option>
                <option value="general">General Citizen</option>
                <option value="nri">NRI Voter</option>
                <option value="differently_abled">Differently Abled</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-400 mb-2">Preferred Language</label>
              <select id="language" value={user?.language || "en"}
                onChange={(e) => updateProfile({ language: e.target.value })} className="input-glass">
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
