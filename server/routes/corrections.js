const express = require("express");
const router = express.Router();
const correctionsController = require("../controllers/correctionsController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/", requireAuth, correctionsController.correctSentences);

module.exports = router; 