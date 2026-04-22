import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminAPI } from "@services/api";
import LoadingSpinner from "@components/LoadingSpinner";
import { Plus, Trash2, Edit3, Users, MessageSquare, HelpCircle, Save, X } from "lucide-react";
import toast from "react-hot-toast";

const StatBadge = ({ icon: Icon, label, value }) => (
  <div className="glass-card p-5">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary-400" />
      <div>
        <p className="font-display text-2xl font-bold text-white">{value ?? "—"}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

const initialFAQ = { question: "", answer: "", category: "general", language: "en", tags: [], isPublished: true };

export default function Admin() {
  const qc = useQueryClient();
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [newFAQ, setNewFAQ] = useState(initialFAQ);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminAPI.getStats().then((r) => r.data.data),
  });

  const { data: faqs = [], isLoading: faqLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => adminAPI.getFAQs().then((r) => r.data.data),
    enabled: tab === "faqs",
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createFAQ(data),
    onSuccess: () => { qc.invalidateQueries(["admin-faqs"]); setShowForm(false); setNewFAQ(initialFAQ); toast.success("FAQ created"); },
    onError: () => toast.error("Failed to create FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteFAQ(id),
    onSuccess: () => { qc.invalidateQueries(["admin-faqs"]); toast.success("FAQ deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  const tabs = ["overview", "faqs"];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-xl" aria-hidden="true">🛡️</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Manage ElectEd AI content</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/[0.06] pb-0">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${tab === t ? "border-primary-500 text-primary-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {statsLoading ? <LoadingSpinner size="lg" className="mx-auto" /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <StatBadge icon={Users} label="Total Users" value={stats?.totalUsers} />
                  <StatBadge icon={MessageSquare} label="Total Chats" value={stats?.totalChats} />
                  <StatBadge icon={HelpCircle} label="Published FAQs" value={stats?.totalFAQs} />
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
                  <div className="space-y-3">
                    {stats?.recentUsers?.map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                        <div>
                          <p className="text-sm font-medium text-white">{u.displayName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        <span className="text-xs text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {stats?.usersByType?.length > 0 && (
                  <div className="glass-card p-6 mt-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Users by Type</h2>
                    <div className="space-y-2">
                      {stats.usersByType.map((t) => (
                        <div key={t._id} className="flex items-center justify-between">
                          <span className="text-sm text-slate-400 capitalize">{t._id?.replace("_", " ")}</span>
                          <span className="text-sm font-semibold text-white">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* FAQs Tab */}
        {tab === "faqs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Manage FAQs</h2>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
                <Plus className="w-4 h-4" /> Add FAQ
              </button>
            </div>

            {showForm && (
              <div className="glass-card p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-white">New FAQ</h3>
                <input value={newFAQ.question} onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  placeholder="Question" className="input-glass" />
                <textarea value={newFAQ.answer} onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                  placeholder="Answer" rows={4} className="input-glass resize-none" />
                <div className="flex gap-3">
                  <select value={newFAQ.category} onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })} className="input-glass flex-1">
                    {["general","registration","voting","eligibility","process","technology"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newFAQ.language} onChange={(e) => setNewFAQ({ ...newFAQ, language: e.target.value })} className="input-glass flex-1">
                    <option value="en">English</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => createMutation.mutate(newFAQ)} disabled={createMutation.isPending}
                    className="btn-primary text-sm px-4 py-2">
                    {createMutation.isPending ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn-ghost text-sm px-4 py-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {faqLoading ? <LoadingSpinner size="lg" className="mx-auto" /> : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq._id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-1">{faq.question}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{faq.answer}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400">{faq.category}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">{faq.language}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteMutation.mutate(faq._id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                        aria-label={`Delete FAQ: ${faq.question}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
