import { motion } from "framer-motion";
import { Vote } from "lucide-react";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3 items-end"
      role="status"
      aria-live="polite"
      aria-label="AI is typing"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center">
        <Vote className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <div className="chat-bubble-ai flex items-center gap-1.5 px-4 py-3.5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
        <span className="sr-only">ElectEd AI is thinking...</span>
      </div>
    </motion.div>
  );
}
