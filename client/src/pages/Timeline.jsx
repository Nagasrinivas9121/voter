import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { timelineAPI } from "@services/api";
import LoadingSpinner from "@components/LoadingSpinner";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

export default function Timeline() {
  const [activePhase, setActivePhase] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["timeline"],
    queryFn: () => timelineAPI.getAll().then((r) => r.data.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-red-400">Failed to load timeline. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="section-label mb-3">Step by Step</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Indian Election{" "}
            <span className="gradient-text">Timeline</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            From voter registration to the swearing-in ceremony — here's how India's democratic process unfolds.
          </p>
          <div className="tricolor-accent w-20 mx-auto mt-6" aria-hidden="true" />
        </motion.div>

        {/* Timeline */}
        <div className="relative" role="list" aria-label="Election timeline phases">
          {/* Connector line */}
          <div
            className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-500/50 via-white/10 to-transparent"
            aria-hidden="true"
          />

          {data?.map((phase, i) => {
            const isActive = activePhase === phase.id;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-20 mb-6"
                role="listitem"
              >
                {/* Phase Number Dot */}
                <div
                  className="absolute left-0 flex items-center justify-center w-16 h-16 rounded-2xl text-2xl shadow-lg border border-white/10"
                  style={{ background: `${phase.color}25`, borderColor: `${phase.color}40` }}
                  aria-hidden="true"
                >
                  <span>{phase.icon}</span>
                </div>

                {/* Card */}
                <button
                  onClick={() => setActivePhase(isActive ? null : phase.id)}
                  className="w-full text-left glass-card-hover p-5 cursor-pointer"
                  aria-expanded={isActive}
                  aria-controls={`phase-details-${phase.id}`}
                  aria-label={`Phase ${phase.id}: ${phase.phase}. Click to ${isActive ? "collapse" : "expand"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                        >
                          Phase {phase.id}
                        </span>
                        <span className="text-xs text-slate-500">{phase.duration}</span>
                      </div>
                      <h2 className="text-lg font-semibold text-white">{phase.phase}</h2>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{phase.description}</p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {isActive ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expandable Details */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      id={`phase-details-${phase.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="glass-card mt-2 p-5">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="text-base" aria-hidden="true">📋</span>
                          Key Steps
                        </h3>
                        <ol className="space-y-2" role="list">
                          {phase.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-3 text-sm text-slate-300">
                              <span
                                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                                style={{ backgroundColor: `${phase.color}60` }}
                                aria-hidden="true"
                              >
                                {si + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>

                        {phase.resources?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <p className="text-xs font-medium text-slate-500 mb-2">Official Resources</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.resources.map((r) => (
                                <a
                                  key={r.url}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 text-xs hover:bg-primary-600/30 transition-colors"
                                  aria-label={`${r.label} (opens in new tab)`}
                                >
                                  {r.label}
                                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
