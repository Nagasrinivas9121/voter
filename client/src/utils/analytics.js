/**
 * Google Analytics event tracking utility.
 * Wraps gtag calls safely — no-ops if GA isn't loaded.
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...params,
        send_to: "G-HKEF9RCMGR",
      });
    }
  } catch (err) {
    console.debug("GA track error:", err);
  }
};

// ─── Priority Event Helpers ──────────────────────────────────────────────

export const trackChatQuery = (queryLength, language) =>
  trackEvent("chat_query", { 
    category: "engagement", 
    query_length: queryLength,
    language: language 
  });

export const trackEligibilityCheck = (results) =>
  trackEvent("eligibility_check", { 
    category: "tools", 
    status: results.status,
    age_group: results.age >= 18 ? "adult" : "minor"
  });

export const trackTimelineView = (phaseId = "overview") =>
  trackEvent("timeline_view", { 
    category: "education", 
    phase_id: phaseId 
  });

// ─── Supplementary Helpers ──────────────────────────────────────────────

export const trackLogin = (method = "google") =>
  trackEvent("login", { method });

export const trackLanguageSwitch = (language) =>
  trackEvent("language_switch", { category: "settings", language });

export const trackPageView = (pagePath) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-HKEF9RCMGR", {
      page_path: pagePath,
    });
  }
};

