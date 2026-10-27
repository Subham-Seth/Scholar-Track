import { Router, Request, Response } from 'express';
import { isDbConnected } from '../config/db.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = isDbConnected() ? 'connected' : 'disconnected';
  const aiProvider = process.env.GEMINI_API_KEY
    ? 'gemini'
    : process.env.OPENAI_API_KEY
    ? 'openai'
    : 'fallback-knowledge-engine';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Scholar-Track API',
    database: {
      status: dbStatus,
    },
    aiEngine: {
      provider: aiProvider,
      ready: true,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
