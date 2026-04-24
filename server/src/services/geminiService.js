const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are ElectEd AI, a senior civic education consultant. Your goal is to empower Indian citizens with precise, step-by-step knowledge about the election process.

OPERATING PRINCIPLES:
1. ACCURACY: Only provide facts based on Election Commission of India (ECI) guidelines.
2. NEUTRALITY: Absolute political neutrality. Never favor or mention specific parties/candidates.
3. STRUCTURE: Use Markdown (headers, bolding, lists) for readability.
4. ACTIONABILITY: Always provide clear "Next Steps" for any procedure (registration, voting, etc.).
5. CLARITY: Explain technical terms (EVM, VVPAT, MCC) simply but accurately.

RESPONSE FORMAT REQUIREMENTS:
- Use clear headings (###) for different sections.
- For procedures, use a numbered list: 1️⃣ Step 1, 2️⃣ Step 2, etc.
- Include a "Pro-Tip" section for helpful hints.
- Always end with: "Is there any specific part of this process you'd like me to explain in more detail?"

USER CONTEXTS:
- first_time: Focus on encouragement and explaining the "why" and "how" from scratch.
- student: Emphasize democratic values and technical accuracy for educational purposes.
- nri: Focus on Form 6A and overseas voting procedures.
- differently_abled: Prioritize information about PwD app, home voting, and booth accessibility.
- general: Provide concise, direct answers to queries.`;

/**
 * Build a structured prompt for Gemini
 */
const buildPrompt = (message, userType = "general", language = "en", conversationHistory = []) => {
  const languageInstruction = language === "te" 
    ? "IMPORTANT: Respond in Telugu (తెలుగు). Use clear, formal yet accessible language." 
    : "Respond in English.";

  const history = conversationHistory.length > 0
    ? conversationHistory.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")
    : "No previous history.";

  return `
${SYSTEM_PROMPT}

CONTEXT:
- User Category: ${userType}
- Target Language: ${languageInstruction}

CONVERSATION HISTORY:
${history}

USER QUERY:
${message}

INSTRUCTIONS:
1. Address the query based on the User Category provided.
2. Follow the RESPONSE FORMAT REQUIREMENTS strictly.
3. Ensure procedural answers are step-by-step.
4. cite eci.gov.in as the source.
`;
};

/**
 * Send a message to Gemini and get a response
 */
const sendMessage = async ({ message, userType = "general", language = "en", conversationHistory = [] }) => {
  const startTime = Date.now();
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4, // Lower temperature for more factual consistency
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
      }
    });

    const prompt = buildPrompt(message, userType, language, conversationHistory);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    logger.info("Gemini response generated", { 
      userType, 
      language, 
      responseTime: Date.now() - startTime,
      tokens: response.usageMetadata?.totalTokenCount
    });

    return {
      content: text,
      model: "gemini-1.5-flash",
      tokens: response.usageMetadata?.totalTokenCount || 0,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    logger.error("Gemini API error:", { error: error.message });
    if (error.message?.includes("SAFETY")) {
      return {
        content: "### ⚠️ Safety Notice\nI cannot fulfill this request as it violates safety guidelines regarding political neutrality or sensitive content. Please ask me about the **official election procedures** instead.",
        safetyBlocked: true,
      };
    }
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
};

/**
 * Generate a structured eligibility report
 */
const checkEligibility = async ({ age, isIndianCitizen, hasVoterID, state, userType }) => {
  const prompt = `
${SYSTEM_PROMPT}

Analyze the following user profile for voting eligibility in India:
- Age: ${age}
- Indian Citizen: ${isIndianCitizen}
- Has Voter ID: ${hasVoterID}
- State: ${state || "Not specified"}

Provide a structured report in Markdown:
1. **Eligibility Status**: (ELIGIBLE / NOT ELIGIBLE / ACTION REQUIRED)
2. **Detailed Analysis**: Why this status was assigned.
3. **Actionable Roadmap**: Step-by-step guide on what to do next.
4. **Key Dates/Resources**: Mention relevant ECI portals.
5. **Special Note**: Specific advice for a '${userType}' user.

Ensure the tone is helpful and professional.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error("Gemini eligibility check error:", { error: error.message });
    throw new Error("Eligibility check service unavailable");
  }
};

module.exports = { sendMessage, checkEligibility };

