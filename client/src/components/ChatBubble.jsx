import { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Vote } from "lucide-react";

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatBubble = memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="article"
      aria-label={`${isUser ? "Your" : "AI"} message`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center mt-1"
          aria-hidden="true"
        >
          <Vote className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        {isUser ? (
          <div className="chat-bubble-user">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        ) : (
          <div className="chat-bubble-ai">
            <div className="ai-content prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <time
          dateTime={message.timestamp?.toISOString()}
          className="text-[11px] text-slate-600 px-1"
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </motion.div>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
