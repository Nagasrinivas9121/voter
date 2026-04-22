import { motion } from "framer-motion";

const PROMPTS = [
  { id: 1, text: "How do I register to vote?", icon: "📋" },
  { id: 2, text: "Am I eligible to vote in India?", icon: "✅" },
  { id: 3, text: "What is the election timeline?", icon: "📅" },
  { id: 4, text: "How does vote counting work?", icon: "🔢" },
  { id: 5, text: "What is EVM and VVPAT?", icon: "🖥️" },
  { id: 6, text: "What is the Model Code of Conduct?", icon: "📜" },
  { id: 7, text: "How to find my polling booth?", icon: "📍" },
  { id: 8, text: "I'm a first-time voter, help me!", icon: "🌟" },
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      role="group"
      aria-label="Suggested questions"
    >
      {PROMPTS.map((prompt, i) => (
        <motion.button
          key={prompt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          onClick={() => onSelect(prompt.text)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-primary-500/40 text-left text-sm text-slate-300 hover:text-white transition-all duration-200 group cursor-pointer"
          aria-label={`Ask: ${prompt.text}`}
        >
          <span className="text-lg flex-shrink-0" aria-hidden="true">{prompt.icon}</span>
          <span className="line-clamp-2 group-hover:text-white transition-colors">{prompt.text}</span>
        </motion.button>
      ))}
    </div>
  );
}
