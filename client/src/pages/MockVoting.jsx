import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight, Info } from "lucide-react";

const CANDIDATES = [
  { id: "A", name: "Arjun Sharma", party: "People's Progress Party", symbol: "🌿", color: "#22c55e" },
  { id: "B", name: "Priya Nair", party: "United Citizens Front", symbol: "⭐", color: "#f59e0b" },
  { id: "C", name: "Ravi Kumar", party: "National Democratic Alliance", symbol: "🪷", color: "#6366f1" },
  { id: "NOTA", name: "NOTA", party: "None of the Above", symbol: "✗", color: "#64748b" },
];

const STEPS = [
  { id: 1, title: "Verify Your Identity", desc: "Show your Voter ID card to the polling officer", icon: "🪪" },
  { id: 2, title: "Get Ink Mark", desc: "Indelible ink is applied to your left index finger", icon: "🖊️" },
  { id: 3, title: "Receive Ballot Slip", desc: "You receive a slip to proceed to the EVM booth", icon: "📄" },
  { id: 4, title: "Vote on EVM", desc: "Press the button next to your chosen candidate", icon: "🗳️" },
  { id: 5, title: "VVPAT Verification", desc: "A paper slip shows your vote for 7 seconds", icon: "🖨️" },
  { id: 6, title: "Exit the Booth", desc: "Your vote is cast! Leave the booth quietly", icon: "🚪" },
];

export default function MockVoting() {
  const [step, setStep] = useState(0); // 0=intro, 1-6=steps, 7=vote, 8=done
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showVVPAT, setShowVVPAT] = useState(false);

  const reset = () => {
    setStep(0);
    setSelectedCandidate(null);
    setConfirmed(false);
    setShowVVPAT(false);
  };

  const handleVote = (candidate) => {
    setSelectedCandidate(candidate);
    setShowVVPAT(true);
    setTimeout(() => {
      setShowVVPAT(false);
      setConfirmed(true);
      setTimeout(() => setStep(8), 1000);
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="section-label mb-3">Practice Makes Perfect</p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Mock Voting <span className="gradient-text">Simulation</span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Practice the voting process safely. Learn how an EVM works and what to expect at a polling booth.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            <Info className="w-3.5 h-3.5" />
            This is a simulation — no real votes are cast
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Intro */}
          {step === 0 && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card p-8 text-center">
              <span className="text-6xl mb-6 block" aria-hidden="true">🗳️</span>
              <h2 className="text-xl font-bold text-white mb-3">Welcome to the Polling Booth</h2>
              <p className="text-slate-400 text-sm mb-8">
                This simulation will walk you through all 6 steps of the actual voting process in India.
                It mirrors exactly what you'll experience at a real polling booth.
              </p>
              <button onClick={() => setStep(1)} className="btn-primary px-8 py-4 text-base">
                Start Simulation <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Steps 1–6 */}
          {step >= 1 && step <= 6 && (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="glass-card p-8">
              {/* Progress */}
              <div className="flex items-center gap-1.5 mb-8" aria-label={`Step ${step} of 6`}>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-primary-500" : i === step - 1 ? "bg-primary-400" : "bg-white/10"}`} aria-hidden="true" />
                ))}
              </div>

              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block" aria-hidden="true">{STEPS[step - 1].icon}</span>
                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">Step {step} of 6</p>
                <h2 className="text-xl font-bold text-white mb-3">{STEPS[step - 1].title}</h2>
                <p className="text-slate-400 leading-relaxed">{STEPS[step - 1].desc}</p>
              </div>

              <div className="flex gap-3">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="btn-ghost flex-1 justify-center">Back</button>
                )}
                <button
                  onClick={() => step < 6 ? setStep(step + 1) : setStep(7)}
                  className="btn-primary flex-1 justify-center"
                >
                  {step === 6 ? "Proceed to Vote" : "Next Step"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* EVM Voting */}
          {step === 7 && (
            <motion.div key="evm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {/* VVPAT overlay */}
              <AnimatePresence>
                {showVVPAT && selectedCandidate && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    role="dialog" aria-modal="true" aria-label="VVPAT verification slip"
                  >
                    <div className="glass-card p-8 max-w-sm mx-4 text-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">{selectedCandidate.symbol}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">VVPAT Paper Slip</p>
                      <p className="text-white font-semibold">{selectedCandidate.name}</p>
                      <p className="text-slate-400 text-sm">{selectedCandidate.party}</p>
                      <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                        <p className="text-amber-400 text-xs">This slip is displayed for 7 seconds for verification, then it drops into a sealed box.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass-card p-6">
                <h2 className="text-center text-lg font-bold text-white mb-2">🖥️ Electronic Voting Machine (EVM)</h2>
                <p className="text-center text-slate-400 text-sm mb-6">Press the blue button next to your chosen candidate</p>

                <div className="space-y-3" role="group" aria-label="Candidate selection">
                  {CANDIDATES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => !confirmed && handleVote(c)}
                      disabled={confirmed}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                        selectedCandidate?.id === c.id
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                      } disabled:cursor-not-allowed`}
                      aria-label={`Vote for ${c.name} from ${c.party}`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2" style={{ borderColor: c.color, backgroundColor: `${c.color}20` }}>
                        {c.symbol}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.party}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Completion */}
          {step === 8 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-emerald-400" aria-hidden="true" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-white mb-3">
                🎉 Vote Cast Successfully!
              </h2>
              <p className="text-slate-400 mb-2">
                You voted for <span className="text-white font-semibold">{selectedCandidate?.name}</span>
              </p>
              <p className="text-slate-500 text-sm mb-8">
                In a real election, your vote is now sealed and counted along with millions of others.
                Your identity remains completely secret.
              </p>
              <div className="p-4 bg-primary-600/10 border border-primary-500/30 rounded-xl mb-8 text-sm text-slate-300 text-left space-y-2">
                <p className="font-semibold text-white">🎓 What you learned:</p>
                <p>✅ Voter identity verification process</p>
                <p>✅ How indelible ink prevents duplicate voting</p>
                <p>✅ How EVMs work in polling booths</p>
                <p>✅ VVPAT verification slip system</p>
                <p>✅ Ballot secrecy and voter privacy</p>
              </div>
              <button onClick={reset} className="btn-primary px-8 py-3">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
