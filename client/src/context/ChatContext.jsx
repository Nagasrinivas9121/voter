import { createContext, useContext, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { chatAPI } from "@services/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isLoading) return;

      const userMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await chatAPI.sendMessage({
          message: content.trim(),
          sessionId: sessionId || undefined,
          language,
          userType: user?.userType || "general",
        });

        const { message: aiMsg, sessionId: newSessionId } = response.data;

        if (!sessionId && newSessionId) {
          setSessionId(newSessionId);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            role: "assistant",
            content: aiMsg.content,
            timestamp: new Date(aiMsg.timestamp),
          },
        ]);
      } catch (error) {
        const errMsg = error.response?.data?.message || "Failed to get response. Please try again.";
        toast.error(errMsg);
        // Remove the user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, language, user]
  );

  const loadSession = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const res = await chatAPI.getSession(id);
      const session = res.data.data;
      setSessionId(id);
      setLanguage(session.language || "en");
      setMessages(
        session.messages.map((m, i) => ({
          id: `${m.role}_${i}_${Date.now()}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }))
      );
    } catch {
      toast.error("Failed to load chat session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setIsLoading(false);
  }, []);

  const addQuickPrompt = useCallback(
    (prompt) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        sessionId,
        isLoading,
        language,
        setLanguage,
        sendMessage,
        loadSession,
        startNewChat,
        addQuickPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

export default ChatContext;
