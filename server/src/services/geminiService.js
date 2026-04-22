const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are ElectEd AI, an expert and friendly assistant that educates Indian citizens about the election process in India. 

CORE RESPONSIBILITIES:
- Explain election procedures clearly and step-by-step
- Provide accurate information about voter registration, eligibility, voting process, counting, and results
- Answer questions about the Election Commission of India (ECI) rules and guidelines
- Explain technical terms (EVM, VVPAT, MCC, Returning Officer, etc.) in simple language
- Provide helpful information for first-time voters, students, NRIs, and differently-abled citizens

GUARDRAILS (STRICT - NEVER VIOLATE):
1. NEVER promote any political party, candidate, or ideology
2. NEVER share misinformation or unverified facts
3. NEVER make predictions about election outcomes
4. If asked about political opinions, politely redirect to factual information
5. Always cite the Election Commission of India as the authoritative source
6. If you are unsure, say "I recommend checking the official ECI website at eci.gov.in"

TONE & STYLE:
- Friendly, approachable, and encouraging
- Use simple language, avoid jargon unless explained
- Be concise but thorough
- Use numbered lists and bullet points for clarity
- For Telugu speakers, respond in Telugu if the language context is "te"

PERSONALIZATION:
- Adapt explanations based on user type (first_time_voter, student, general, nri, differently_abled)
- For first-time voters: be extra encouraging and explain basics thoroughly
- For students: use relatable examples and emphasize civic responsibility
- For NRI voters: focus on NRI-specific voting provisions
- For differently-abled: mention specific accommodations and accessibility features

IMPORTANT: Always end responses with an offer to explain more or answer follow-up questions.`;

const USER_TYPE_CONTEXT = {
  first_time: "This is a first-time voter who needs encouragement and basic explanations.",
  student: "This is a student learning about the election process for civic education.",
  general: "This is a general citizen with basic knowledge of elections.",
  nri: "This is an NRI (Non-Resident Indian) who wants to understand their voting rights.",
  differently_abled: "This is a differently-abled citizen who needs information about accessibility provisions.",
};

/**
 * Build a context-aware prompt for Gemini
 */
const buildPrompt = (message, userType = "general", language = "en", conversationHistory = []) => {
  const userContext = USER_TYPE_CONTEXT[userType] || USER_TYPE_CONTEXT.general;
  const languageInstruction =
    language === "te"
      ? "Please respond in Telugu (తెలుగు) language."
      : "Please respond in English.";

  const contextBlock = `
USER CONTEXT: ${userContext}
LANGUAGE: ${languageInstruction}
`;

  // Build conversation history for context memory
  const historyText =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-6) // Last 3 exchanges for context window efficiency
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n")
      : "";

  const fullPrompt = `${SYSTEM_PROMPT}

${contextBlock}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n\n` : ""}Current user message: ${message}`;

  return fullPrompt;
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
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    const prompt = buildPrompt(message, userType, language, conversationHistory);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const responseTime = Date.now() - startTime;

    return {
      content: text,
      model: "gemini-1.5-flash",
      tokens: response.usageMetadata?.totalTokenCount || 0,
      responseTime,
    };
  } catch (error) {
    logger.error("Gemini API error:", error);
    if (error.message?.includes("SAFETY")) {
      return {
        content:
          "I'm unable to respond to that query as it may contain inappropriate content. Please ask me about the Indian election process, voter registration, or how to vote.",
        model: "gemini-1.5-flash",
        tokens: 0,
        responseTime: Date.now() - startTime,
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
  const prompt = `${SYSTEM_PROMPT}

Based on the following user details, provide a clear eligibility assessment for voting in Indian elections:
- Age: ${age}
- Indian Citizen: ${isIndianCitizen ? "Yes" : "No"}
- Has Voter ID: ${hasVoterID ? "Yes" : "No"}
- State: ${state || "Not specified"}
- User Type: ${userType || "general"}

Provide:
1. Eligibility status (Eligible / Not Eligible / Partially Eligible)
2. Explanation for the status
3. Next steps they should take
4. Relevant links or resources (eci.gov.in, voters.eci.gov.in)
5. Special provisions if applicable

Format the response in a structured, easy-to-read format.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error("Gemini eligibility check error:", error);
    throw new Error("Eligibility check service unavailable");
  }
};

module.exports = { sendMessage, checkEligibility };
