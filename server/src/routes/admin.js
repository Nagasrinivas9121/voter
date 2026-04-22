const express = require("express");
const router = express.Router();
const { getFAQs, createFAQ, updateFAQ, deleteFAQ, getElectionInfo, upsertElectionInfo, getStats } =
  require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/faqs", getFAQs);
router.post("/faqs", validate(schemas.admin.faq), createFAQ);
router.put("/faqs/:id", validate(schemas.admin.faq), updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

router.get("/election-info", getElectionInfo);
router.post("/election-info", validate(schemas.admin.electionInfo), upsertElectionInfo);

module.exports = router;
