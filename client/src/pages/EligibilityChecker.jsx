import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eligibilityAPI } from "@services/api";
import { CheckCircle, XCircle, AlertCircle, ExternalLink, ArrowRight } from "lucide-react";
import LoadingSpinner from "@components/LoadingSpinner";
import { trackEligibilityCheck } from "@utils/analytics";


const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry",
];

export default function EligibilityChecker() {
  const [form, setForm] = useState({ age: "", isIndianCitizen: null, hasVoterID: null, state: "" });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.age || form.isIndianCitizen === null || form.hasVoterID === null) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        age: parseInt(form.age),
        isIndianCitizen: form.isIndianCitizen,
        hasVoterID: form.hasVoterID,
        state: form.state,
      };
      const res = await eligibilityAPI.check(payload);
      const resultData = res.data.data;
      setResult(resultData);
      
      trackEligibilityCheck({
        age: payload.age,
        status: resultData.isEligible ? "eligible" : "not_eligible"
      });
    } catch (err) {

      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const RadioGroup = ({ label, value, onChange }) => (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3">{label} <span className="text-red-400">*</span></p>
      <div className="flex gap-3">
        {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(({ val, label: l }) => (
          <button key={String(val)} type="button" onClick={() => onChange(val)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${value === val ? "bg-primary-600/30 border-primary-500 text-primary-300" : "border-white/10 text-slate-400 hover:border-white/20"}`}
            aria-pressed={value === val}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="section-label mb-3">Am I Eligible?</p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Voter Eligibility <span className="gradient-text">Checker</span>
          </h1>
          <p className="text-slate-400">Find out if you can vote in Indian elections and what steps to take next.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="glass-card p-8 space-y-6" noValidate aria-label="Eligibility form">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-2">Age <span className="text-red-400">*</span></label>
                <input id="age" type="number" min="1" max="120" value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Enter your age" className="input-glass" required />
              </div>
              <RadioGroup label="Are you an Indian Citizen?" value={form.isIndianCitizen} onChange={(v) => setForm({ ...form, isIndianCitizen: v })} />
              <RadioGroup label="Do you have a Voter ID (EPIC) card?" value={form.hasVoterID} onChange={(v) => setForm({ ...form, hasVoterID: v })} />
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">State <span className="text-slate-500 text-xs">(optional)</span></label>
                <select id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-glass">
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3" role="alert">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-4 text-base">
                {isLoading ? <LoadingSpinner size="sm" /> : <><span>Check My Eligibility</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </motion.form>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className={`glass-card p-8 text-center ${result.isEligible ? "border-emerald-500/30" : "border-red-500/30"}`}>
                {result.isEligible
                  ? <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  : <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />}
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {result.isEligible ? "✅ You're Eligible to Vote!" : "❌ Not Yet Eligible"}
                </h2>
                {result.isEligible && !result.isRegistered && (
                  <p className="text-amber-400 text-sm">⚠️ You haven't registered yet — follow the steps below</p>
                )}
              </div>

              {result.steps?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Next Steps</h3>
                  <ol className="space-y-3">
                    {result.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600/40 text-primary-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.aiExplanation && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-white mb-3">🤖 AI Explanation</h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{result.aiExplanation}</p>
                </div>
              )}

              {result.resources?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Official Resources</h3>
                  <div className="space-y-2">
                    {result.resources.map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors group">
                        <span className="text-sm text-slate-300 group-hover:text-white">{r.label}</span>
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setResult(null)} className="btn-ghost w-full justify-center">Check Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
