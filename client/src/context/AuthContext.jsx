import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { auth, googleProvider } from "@services/firebase";
import { authAPI } from "@services/api";
import { trackLogin } from "@utils/analytics";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("general");

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("elected_token");
    const storedUser = localStorage.getItem("elected_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserType(parsedUser.userType || "general");
        // Verify token is still valid
        authAPI
          .verify()
          .then((res) => {
            setUser(res.data.user);
          })
          .catch(() => {
            localStorage.removeItem("elected_token");
            localStorage.removeItem("elected_user");
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (selectedUserType = "general") => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await authAPI.googleLogin(idToken, selectedUserType);
      const { token, user: userData } = response.data;

      localStorage.setItem("elected_token", token);
      localStorage.setItem("elected_user", JSON.stringify(userData));
      setUser(userData);
      setUserType(userData.userType || "general");

      toast.success(`Welcome, ${userData.displayName}! 🎉`);
      trackLogin("google");
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      await signOut(auth);
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem("elected_token");
      localStorage.removeItem("elected_user");
      setUser(null);
      setUserType("general");
      toast.success("Logged out successfully");
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      const updated = res.data.user;
      setUser(updated);
      setUserType(updated.userType || "general");
      localStorage.setItem("elected_user", JSON.stringify(updated));
      toast.success("Profile updated!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const value = {
    user,
    loading,
    userType,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
