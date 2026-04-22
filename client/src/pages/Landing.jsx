import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Vote, Shield, Calendar, MessageSquare, ArrowRight, CheckCircle, Users, Star } from "lucide-react";

const features = [
  {
    icon: "🤖",
    title: "AI Election Assistant",
    description: "Chat with Gemini AI — get instant, accurate answers about every step of the Indian election process.",
    color: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/30",
  },
  {
    icon: "📅",
    title: "Election Timeline",
    description: "Visual step-by-step walkthrough from voter registration to results — know what happens and when.",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
  {
    icon: "✅",
    title: "Eligibility Checker",
    description: "Find out if you can vote, what documents you need, and how to register — in minutes.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
  },
  {
    icon: "🗳️",
    title: "Mock Voting Simulation",
    description: "Practice the voting process in a safe simulation — perfect for first-time voters.",
    color: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/30",
  },
];

const stats = [
  { value: "970M+", label: "Registered Voters in India", icon: Users },
  { value: "7", label: "Phases of Election Process", icon: Calendar },
  { value: "24/7", label: "AI Assistant Available", icon: Star },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      const result = await loginWithGoogle();
      if (result.success) navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-dark-900 to-dark-900" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/15 border border-primary-500/30 text-primary-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-slow" aria-hidden="true" />
              Powered by Google Gemini AI
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Understand</span>{" "}
            <span className="gradient-text">Indian</span>
            <br />
            <span className="text-white">Elections</span>{" "}
            <span className="gradient-text-saffron">Effortlessly</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            ElectEd AI is your intelligent guide to India's democratic process — from voter registration to results. Ask anything, learn everything.
          </motion.p>

          {/* India Tricolor Bar */}
          <motion.div variants={itemVariants} className="tricolor-accent w-24 mx-auto mb-10" aria-hidden="true" />

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="btn-primary text-base px-8 py-4 group"
              aria-label={isAuthenticated ? "Open AI Chat" : "Sign in and start chatting"}
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
              {isAuthenticated ? "Open AI Chat" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            <Link
              to="/timeline"
              className="btn-ghost text-base px-8 py-4"
              aria-label="View election timeline"
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              View Election Timeline
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {["Election Commission of India data", "Available in English & Telugu", "Free to use"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          aria-hidden="true"
        >
          <div className="w-6 h-9 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.06]" aria-label="Statistics">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Features">
        <div className="text-center mb-16">
          <p className="section-label mb-3">What You Get</p>
          <h2 className="font-display text-4xl font-bold text-white">
            Everything You Need to{" "}
            <span className="gradient-text">Vote Confidently</span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`glass-card-hover p-6 bg-gradient-to-br ${feature.color} ${feature.border}`}
            >
              <span className="text-4xl mb-4 block" aria-hidden="true">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────── */}
      <section className="py-24" aria-label="Call to action">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-indigo-600/10" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Vote is{" "}
                <span className="gradient-text-saffron">Your Voice</span>
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Democracy works best when citizens are informed. Start your election education journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="btn-saffron text-base px-8 py-4"
                  aria-label="Start learning about elections"
                >
                  🗳️ Start Learning
                </button>
                <Link to="/eligibility" className="btn-ghost text-base px-8 py-4">
                  <Shield className="w-5 h-5" /> Check Eligibility
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
