/**
 * Google Analytics event tracking utility.
 * Wraps gtag calls safely — no-ops if GA isn't loaded.
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  } catch {
    // silently fail in dev or if GA blocked
  }
};

// ─── Pre-built event helpers ──────────────────────────────────────────────

export const trackChatMessage = () =>
  trackEvent("chat_message_sent", { category: "engagement" });

export const trackEligibilityCheck = (isEligible) =>
  trackEvent("eligibility_check", { category: "engagement", eligible: isEligible });

export const trackMockVoteComplete = () =>
  trackEvent("mock_vote_complete", { category: "engagement" });

export const trackTimelinePhaseExpand = (phaseId) =>
  trackEvent("timeline_phase_expand", { category: "engagement", phase_id: phaseId });

export const trackLogin = (method = "google") =>
  trackEvent("login", { method });

export const trackLanguageSwitch = (language) =>
  trackEvent("language_switch", { category: "settings", language });

export const trackPageView = (pageName) =>
  trackEvent("page_view", { page_title: pageName });
