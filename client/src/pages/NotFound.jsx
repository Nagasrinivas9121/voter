import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <p className="font-display text-[120px] font-black text-white/5 leading-none select-none" aria-hidden="true">404</p>
        <div className="-mt-8">
          <span className="text-5xl" aria-hidden="true">🗳️</span>
          <h1 className="font-display text-3xl font-bold text-white mt-4 mb-3">Page Not Found</h1>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            Looks like this polling booth doesn't exist. Let's get you back on the right track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary px-8 py-3">
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-ghost px-8 py-3">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
