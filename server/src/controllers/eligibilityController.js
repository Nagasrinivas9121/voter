const geminiService = require("../services/geminiService");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * POST /api/eligibility/check
 * Check voter eligibility based on user's details
 */
const checkEligibility = asyncHandler(async (req, res) => {
  const { age, isIndianCitizen, hasVoterID, state, constituency } = req.body;

  const isEligible = age >= 18 && isIndianCitizen;
  const isRegistered = hasVoterID;

  const eligibilityData = {
    isEligible,
    isRegistered,
    age,
    isIndianCitizen,
    hasVoterID,
    state: state || null,
    constituency: constituency || null,
  };

  // Get AI-generated explanation
  const aiExplanation = await geminiService.checkEligibility({
    age,
    isIndianCitizen,
    hasVoterID,
    state,
    userType: req.user?.userType || "general",
  });

  const steps = [];
  if (!isIndianCitizen) {
    steps.push("Only Indian citizens can vote in Indian elections.");
  } else if (age < 18) {
    steps.push(`You will be eligible to vote in ${18 - age} year(s) when you turn 18.`);
    steps.push("Keep your documents ready for voter registration when eligible.");
  } else {
    if (!hasVoterID) {
      steps.push("Apply for a Voter ID card at voters.eci.gov.in");
      steps.push("You can also use Aadhaar + other docs as alternate ID at booths in some states");
    }
    steps.push("Find your polling booth at electoralsearch.eci.gov.in");
    steps.push("Carry any approved photo ID on polling day");
  }

  res.status(200).json({
    success: true,
    data: {
      ...eligibilityData,
      steps,
      aiExplanation,
      resources: [
        { label: "Voter Registration", url: "https://voters.eci.gov.in" },
        { label: "Election Commission of India", url: "https://eci.gov.in" },
        { label: "Find Polling Booth", url: "https://electoralsearch.eci.gov.in" },
      ],
    },
  });
});

module.exports = { checkEligibility };
