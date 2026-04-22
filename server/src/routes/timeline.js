const express = require("express");
const router = express.Router();
const { getTimeline, getPhase } = require("../controllers/timelineController");

router.get("/", getTimeline);
router.get("/:id", getPhase);

module.exports = router;
