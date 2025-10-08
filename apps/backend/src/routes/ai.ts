import express, { Router } from "express";
import { AIController } from "../controllers/AIController";

const router: Router = express.Router();

// POST /api/ai/generate-message - Generate a personalized message
router.post("/generate-message", AIController.generateMessage);

// POST /api/ai/message-suggestions - Get message suggestions
router.post("/message-suggestions", AIController.getMessageSuggestions);

// GET /api/ai/health - Check AI service availability
router.get("/health", AIController.checkHealth);

export default router;
