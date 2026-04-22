const express = require("express");
const router = express.Router();
const { getOverview, getActivity } = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/overview", getOverview);
router.get("/activity", getActivity);

module.exports = router;
