const express = require("express");
const router = express.Router();
const { sendMessage, getSessions, getSession, deleteSession } = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const { chatLimiter } = require("../middleware/rateLimiter");

router.post("/send", authenticate, chatLimiter, validate(schemas.chat.send), sendMessage);
router.get("/sessions", authenticate, getSessions);
router.get("/session/:id", authenticate, getSession);
router.delete("/session/:id", authenticate, deleteSession);

module.exports = router;
