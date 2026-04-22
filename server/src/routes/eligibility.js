const express = require("express");
const router = express.Router();
const { checkEligibility } = require("../controllers/eligibilityController");
const { validate, schemas } = require("../middleware/validate");
const { optionalAuth } = require("../middleware/auth");

router.post("/check", optionalAuth, validate(schemas.eligibility.check), checkEligibility);

module.exports = router;
