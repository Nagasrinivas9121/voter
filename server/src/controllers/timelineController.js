const { asyncHandler } = require("../middleware/errorHandler");
const cacheService = require("../services/cacheService");

// ─── Election Timeline Data ────────────────────────────────────────────────
// Sourced from the Election Commission of India (eci.gov.in)
const ELECTION_TIMELINE = [
  {
    id: 1,
    phase: "Voter Registration",
    icon: "📋",
    color: "#6366f1",
    description:
      "Citizens aged 18+ can register to vote. Electoral rolls are updated annually with January 1st as the reference date.",
    duration: "Ongoing (Annual revision)",
    steps: [
      "Visit voters.eci.gov.in or use Voter Helpline App",
      "Fill Form 6 for new registration",
      "Submit required documents (age, address, identity proof)",
      "Track your application status online",
      "Receive EPIC (Voter ID) card by post",
    ],
    resources: [{ label: "Register Online", url: "https://voters.eci.gov.in" }],
  },
  {
    id: 2,
    phase: "Election Announcement",
    icon: "📢",
    color: "#f59e0b",
    description:
      "The Election Commission of India announces election dates. The Model Code of Conduct (MCC) comes into effect immediately.",
    duration: "3–4 months before election",
    steps: [
      "ECI issues official press note with election schedule",
      "Model Code of Conduct activates immediately",
      "Governments restricted from announcing new schemes",
      "Appointment of Election Observers begins",
    ],
    resources: [{ label: "ECI Official", url: "https://eci.gov.in" }],
  },
  {
    id: 3,
    phase: "Nomination Filing",
    icon: "📝",
    color: "#10b981",
    description:
      "Candidates file nomination papers with the Returning Officer. Scrutiny follows to verify eligibility.",
    duration: "7–14 days",
    steps: [
      "Candidate obtains nomination form from Returning Officer",
      "Files form with required security deposit",
      "Affidavit declaring criminal background, assets & liabilities",
      "Scrutiny of nominations by Returning Officer",
      "Last date for withdrawal of candidature",
    ],
    resources: [],
  },
  {
    id: 4,
    phase: "Campaigning",
    icon: "🗣️",
    color: "#3b82f6",
    description:
      "Political parties and candidates campaign for voter support through rallies, advertisements, and door-to-door campaigns.",
    duration: "2–3 weeks",
    steps: [
      "Campaign rallies, public meetings, door-to-door canvassing",
      "Spending within election commission limits",
      "Ban on paid news and misuse of government resources",
      "Campaign silence period begins 48 hours before polling",
      "Exit polls banned during polling phases",
    ],
    resources: [],
  },
  {
    id: 5,
    phase: "Polling Day",
    icon: "🗳️",
    color: "#ec4899",
    description:
      "Eligible registered voters cast their votes at designated polling booths using EVMs (Electronic Voting Machines).",
    duration: "7 AM – 6 PM",
    steps: [
      "Voter checks their name in electoral roll",
      "Carries approved photo ID to polling booth",
      "Gets ink mark on left index finger",
      "Votes using EVM (Electronic Voting Machine)",
      "VVPAT slip displayed for 7 seconds for verification",
      "Gets voting slip/receipt",
    ],
    resources: [
      { label: "Find Polling Booth", url: "https://electoralsearch.eci.gov.in" },
    ],
  },
  {
    id: 6,
    phase: "Vote Counting",
    icon: "🔢",
    color: "#8b5cf6",
    description:
      "EVM votes are counted at counting centers under strict security and multi-party observation.",
    duration: "1 day (2–3 days after polling)",
    steps: [
      "EVMs transported to counting centers under security",
      "Counting agents from all parties present",
      "Postal ballots counted first",
      "EVM votes counted round-by-round",
      "Returning Officer announces winner after each round",
      "Winning candidate issued election certificate",
    ],
    resources: [],
  },
  {
    id: 7,
    phase: "Results & Government Formation",
    icon: "🏆",
    color: "#f97316",
    description:
      "Winners are declared. In general elections, the party/coalition with majority forms the government.",
    duration: "1–4 weeks after counting",
    steps: [
      "Election Commission declares official results",
      "Losing candidates may file election petitions in High Court",
      "Majority party/coalition invited to form government",
      "President/Governor invites leader to prove majority",
      "Cabinet sworn in by President/Governor",
    ],
    resources: [{ label: "ECI Results", url: "https://results.eci.gov.in" }],
  },
];

/**
 * GET /api/timeline
 * Returns all 7 election phases with 1-hour caching
 */
const getTimeline = asyncHandler(async (req, res) => {
  const cached = cacheService.get("timeline");
  if (cached) {
    return res
      .status(200)
      .json({ success: true, data: cached, fromCache: true });
  }

  cacheService.set("timeline", ELECTION_TIMELINE, 3600);
  res.status(200).json({ success: true, data: ELECTION_TIMELINE });
});

/**
 * GET /api/timeline/:id
 * Returns a specific election phase by ID
 */
const getPhase = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1 || id > 7) {
    return res
      .status(400)
      .json({ success: false, message: "Phase ID must be between 1 and 7" });
  }

  const phase = ELECTION_TIMELINE.find((p) => p.id === id);
  if (!phase) {
    return res.status(404).json({ success: false, message: "Phase not found" });
  }

  res.status(200).json({ success: true, data: phase });
});

module.exports = { getTimeline, getPhase };
