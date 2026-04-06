import { Request, Response } from "express";
import { aiService } from "../services/AIService";
import { ApiResponse } from "../types/api";

export class AIController {
  /**
   * POST /api/ai/generate-message
   * Generate a personalized gift message using AI
   */
  static async generateMessage(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Ensure AI service is configured before processing the request
      if (!AIController.ensureConfigured(res)) {
        return;
      }

      // Step 2: Extract structured input from the request body
      const { to, from, occasion, keywords, tone, userPrompt } = req.body;

      // Step 3: Delegate the core generation logic to the service layer
      const message = await aiService.generateGiftMessage({
        to,
        from,
        occasion,
        keywords,
        tone,
        userPrompt,
      });

      // Step 4: Return a consistent success response
      AIController.sendSuccess(
        res,
        { message },
        "Message generated successfully"
      );
    } catch (error: any) {
      AIController.handleError(
        res,
        error,
        "Failed to generate message",
        "generateMessage"
      );
    }
  }

  /**
   * POST /api/ai/message-suggestions
   * Generate message suggestions based on product info
   */
  static async getMessageSuggestions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Step 1: Ensure AI service is configured before processing the request
      if (!AIController.ensureConfigured(res)) {
        return;
      }

      // Step 2: Extract product context from the request body
      const { productName, productDescription } = req.body;

      // Step 3: Delegate suggestion generation to the service layer
      const suggestions = await aiService.generateMessageSuggestions(
        productName,
        productDescription
      );

      // Step 4: Return a consistent success response
      AIController.sendSuccess(
        res,
        { suggestions },
        "Suggestions generated successfully"
      );
    } catch (error: any) {
      AIController.handleError(
        res,
        error,
        "Failed to generate suggestions",
        "getMessageSuggestions"
      );
    }
  }

  /**
   * GET /api/ai/health
   * Check if AI service is available
   */
  static async checkHealth(_req: Request, res: Response): Promise<void> {
    // Step 1: Check whether the AI service is configured
    const isConfigured = aiService.isConfigured();

    // Step 2: Return service availability status
    AIController.sendSuccess(
      res,
      {
        available: isConfigured,
        message: isConfigured
          ? "AI service is available"
          : "AI service is not configured",
      },
      "Health check completed"
    );
  }

  /**
   * Shared guard to ensure the AI service is configured
   */
  private static ensureConfigured(res: Response): boolean {
    if (!aiService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: "AI service is not configured. Please contact support.",
      } as ApiResponse);
      return false;
    }

    return true;
  }

  /**
   * Shared helper for consistent error responses
   */
  private static handleError(
    res: Response,
    error: any,
    fallback: string,
    context: string
  ): void {
    console.error(`Error in ${context}:`, error);

    res.status(500).json({
      success: false,
      error: error?.message || fallback,
    } as ApiResponse);
  }

  /**
   * Shared helper for consistent success responses
   */
  private static sendSuccess<T>(
    res: Response,
    data: T,
    message: string
  ): void {
    res.json({
      success: true,
      data,
      message,
    } as ApiResponse<T>);
  }
}
