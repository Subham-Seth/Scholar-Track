import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from '../middleware/auth.js';
import {
  chatWithScholarBot,
  getAIRecommendations,
  getApplicationGuidance,
} from '../controllers/aiController.js';

const router = Router();

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    success: false,
    message: 'AI request limit reached for this minute. Please wait a few seconds and try again.',
  },
});

router.post('/chat', aiRateLimiter, optionalAuth, chatWithScholarBot);
router.post('/recommendations', optionalAuth, getAIRecommendations);
router.post('/application-guidance', getApplicationGuidance);

export default router;
