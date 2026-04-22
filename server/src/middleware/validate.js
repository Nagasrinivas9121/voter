const Joi = require("joi");
const xss = require("xss");

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return xss(value.trim());
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

/**
 * Validate request body against a Joi schema and sanitize inputs
 */
const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const data = req[target];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ""));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    // Sanitize after validation
    req[target] = sanitizeObject(value);
    next();
  };
};

// ─── Joi Schemas ────────────────────────────────────────────────────────────

const schemas = {
  chat: {
    send: Joi.object({
      message: Joi.string().min(1).max(1000).required(),
      sessionId: Joi.string().optional().allow(""),
      language: Joi.string().valid("en", "te").default("en"),
      userType: Joi.string()
        .valid("first_time", "student", "general", "nri", "differently_abled")
        .default("general"),
    }),
  },

  auth: {
    googleLogin: Joi.object({
      idToken: Joi.string().required(),
      userType: Joi.string()
        .valid("first_time", "student", "general", "nri", "differently_abled")
        .default("general"),
    }),
    updateProfile: Joi.object({
      displayName: Joi.string().min(1).max(100).optional(),
      userType: Joi.string()
        .valid("first_time", "student", "general", "nri", "differently_abled")
        .optional(),
      language: Joi.string().valid("en", "te").optional(),
    }),
  },

  admin: {
    faq: Joi.object({
      question: Joi.string().min(5).max(500).required(),
      answer: Joi.string().min(10).max(5000).required(),
      category: Joi.string()
        .valid("registration", "voting", "eligibility", "process", "technology", "general")
        .default("general"),
      language: Joi.string().valid("en", "te").default("en"),
      tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
      isPublished: Joi.boolean().default(true),
    }),
    electionInfo: Joi.object({
      key: Joi.string().min(2).max(100).required(),
      title: Joi.string().min(2).max(200).required(),
      content: Joi.string().min(5).max(10000).required(),
      category: Joi.string()
        .valid("general", "timeline", "rules", "contacts", "announcement")
        .default("general"),
      isActive: Joi.boolean().default(true),
      effectiveDate: Joi.date().optional(),
      expiryDate: Joi.date().optional(),
    }),
  },

  eligibility: {
    check: Joi.object({
      age: Joi.number().integer().min(1).max(120).required(),
      isIndianCitizen: Joi.boolean().required(),
      hasVoterID: Joi.boolean().required(),
      state: Joi.string().max(100).optional().allow(""),
      constituency: Joi.string().max(200).optional().allow(""),
    }),
  },
};

module.exports = { validate, schemas, sanitizeObject };
