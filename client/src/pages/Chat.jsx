import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Trash2, MessageSquare, Globe } from "lucide-react";
import { useChat } from "@context/ChatContext";
import { useAuth } from "@context/AuthContext";
import ChatBubble from "@components/ChatBubble";
import TypingIndicator from "@components/TypingIndicator";
import SuggestedPrompts from "@components/SuggestedPrompts";
import { chatAPI } from "@services/api";
import { useDebounce } from "@hooks/useDebounce";
import { trackChatQuery, trackLanguageSwitch } from "@utils/analytics";

import toast from "react-hot-toast";

export default function Chat() {
  const { messages, isLoading, sendMessage, startNewChat, addQuickPrompt, language, setLanguage } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const debouncedInput = useDebounce(input, 100);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load sessions
  useEffect(() => {
    chatAPI.getSessions().then((res) => setSessions(res.data.data || [])).catch(() => {});
  }, [messages.length]);

  const handleSend = useCallback(
    (e) => {
      e?.preventDefault();
      const query = input.trim();
      if (!query || isLoading) return;
      
      sendMessage(query);
      trackChatQuery(query.length, language);
      setInput("");
      
      // Reset height of textarea
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    },
    [input, isLoading, sendMessage, language]
  );


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div className="flex h-screen pt-16 bg-dark-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-dark-800 border-r border-white/[0.06] flex flex-col overflow-hidden"
            aria-label="Chat history sidebar"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <button
                onClick={() => { startNewChat(); inputRef.current?.focus(); }}
                className="btn-primary w-full justify-center gap-2 text-sm py-2.5"
                aria-label="Start new chat"
              >
                <PlusCircle className="w-4 h-4" /> New Chat
              </button>
            </div>

            {/* Language Switcher */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <select
                  value={language}
                  onChange={(e) => { setLanguage(e.target.value); trackLanguageSwitch(e.target.value); }}
                  className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500/60"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wider px-2 mb-2">
                Recent Chats
              </p>
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-600 text-center mt-8">No chats yet</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    <MessageSquare className="w-4 h-4 text-slate-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-slate-400 truncate flex-1">{session.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(session._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 text-slate-600 transition-all"
                      aria-label={`Delete chat: ${session.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.userType?.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Chat Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] bg-dark-800/50 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">ElectEd AI Assistant</h1>
            <p className="text-xs text-slate-500">Ask me anything about Indian elections</p>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <span className="text-3xl" aria-hidden="true">🗳️</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Hello, {user?.displayName?.split(" ")[0]}! 👋
                </h2>
                <p className="text-slate-400 text-sm">
                  I'm your AI guide to Indian elections. What would you like to learn today?
                </p>
              </motion.div>
              <SuggestedPrompts onSelect={addQuickPrompt} />
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/[0.06] bg-dark-800/50">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto flex gap-3 items-end"
            aria-label="Chat input form"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about voter registration, polling booths, EVM, eligibility..."
                rows={1}
                className="input-glass resize-none pr-4 py-3.5 min-h-[52px] max-h-32 text-sm leading-relaxed"
                style={{ height: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
                }}
                disabled={isLoading}
                aria-label="Type your message"
                aria-describedby="chat-hint"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-white" aria-hidden="true" />
            </button>
          </form>
          <p id="chat-hint" className="text-xs text-slate-600 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
