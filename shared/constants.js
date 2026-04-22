// Shared constants between client and server

export const ELECTION_PHASES = [
  {
    id: 1,
    phase: "Voter Registration",
    icon: "📋",
    description: "Citizens register to vote and receive voter ID cards",
    duration: "Ongoing (rolls updated annually)",
    keyDates: ["January 1 (Reference date for new voters)", "Electoral roll revision period"],
  },
  {
    id: 2,
    phase: "Election Announcement",
    icon: "📢",
    description: "Election Commission announces election schedule and Model Code of Conduct begins",
    duration: "~3–4 months before election",
    keyDates: ["MCC implementation date", "Schedule announcement"],
  },
  {
    id: 3,
    phase: "Nomination Filing",
    icon: "📝",
    description: "Candidates file nomination papers with the Returning Officer",
    duration: "7–14 days",
    keyDates: ["Last date for nominations", "Scrutiny of nominations"],
  },
  {
    id: 4,
    phase: "Campaigning",
    icon: "🗣️",
    description: "Political parties and candidates campaign to gain voter support",
    duration: "2–3 weeks",
    keyDates: ["Campaign start date", "Campaign silence period (48 hrs before polling)"],
  },
  {
    id: 5,
    phase: "Polling Day",
    icon: "🗳️",
    description: "Eligible voters cast their votes at designated polling booths",
    duration: "1 day (7 AM – 6 PM)",
    keyDates: ["Polling date"],
  },
  {
    id: 6,
    phase: "Vote Counting",
    icon: "🔢",
    description: "EVM votes are counted under strict supervision",
    duration: "1 day",
    keyDates: ["Counting date (usually 2–3 days after polling)"],
  },
  {
    id: 7,
    phase: "Results & Oath",
    icon: "🏆",
    description: "Winners declared, new government sworn in",
    duration: "1–4 weeks after counting",
    keyDates: ["Result announcement", "Oath taking ceremony"],
  },
];

export const SUGGESTED_PROMPTS = [
  { id: 1, text: "How do I register to vote?", icon: "📋" },
  { id: 2, text: "Am I eligible to vote?", icon: "✅" },
  { id: 3, text: "What is the election timeline?", icon: "📅" },
  { id: 4, text: "How does vote counting work?", icon: "🔢" },
  { id: 5, text: "What is EVM and VVPAT?", icon: "🖥️" },
  { id: 6, text: "What is Model Code of Conduct?", icon: "📜" },
  { id: 7, text: "How to find my polling booth?", icon: "📍" },
  { id: 8, text: "What documents do I need to vote?", icon: "🪪" },
];

export const USER_TYPES = [
  { id: "first_time", label: "First-time Voter", icon: "🌟" },
  { id: "student", label: "Student", icon: "🎓" },
  { id: "general", label: "General Citizen", icon: "👤" },
  { id: "nri", label: "NRI Voter", icon: "✈️" },
  { id: "differently_abled", label: "Differently Abled", icon: "♿" },
];

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

export const API_ROUTES = {
  AUTH: {
    GOOGLE_LOGIN: "/api/auth/google",
    VERIFY: "/api/auth/verify",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
  },
  CHAT: {
    SEND: "/api/chat/send",
    HISTORY: "/api/chat/history",
    SESSIONS: "/api/chat/sessions",
    SESSION_BY_ID: "/api/chat/session/:id",
    DELETE_SESSION: "/api/chat/session/:id",
  },
  TIMELINE: {
    GET: "/api/timeline",
    UPDATE: "/api/timeline/:id",
  },
  ELIGIBILITY: {
    CHECK: "/api/eligibility/check",
  },
  ADMIN: {
    FAQS: "/api/admin/faqs",
    FAQ_BY_ID: "/api/admin/faqs/:id",
    ELECTION_INFO: "/api/admin/election-info",
    STATS: "/api/admin/stats",
  },
  DASHBOARD: {
    OVERVIEW: "/api/dashboard/overview",
    ACTIVITY: "/api/dashboard/activity",
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const RATE_LIMITS = {
  CHAT: { windowMs: 60 * 1000, max: 20 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
};
