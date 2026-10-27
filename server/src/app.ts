import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import savedScholarshipRoutes from './routes/savedScholarshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows cross-origin asset loading for React SPA in unified mode
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.includes('localhost') ||
          origin.includes('onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 4. Request Logging (skip in test)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 5. API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/scholarships', scholarshipRoutes);
  app.use('/api/eligibility', eligibilityRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/saved-scholarships', savedScholarshipRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/ai', aiRoutes);

  // 6. Serve frontend static assets if client build exists
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Catch-all for SPA navigation (excluding /api routes)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' does not exist on this server.`,
      });
      return;
    }
    const indexHtml = path.join(clientDistPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) {
        // If client is not built yet in dev, show simple status
        res.status(200).send(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white;">
              <h1>Scholar-Track API Server Running</h1>
              <p>Backend API is active. Start the Vite client dev server or run <code>npm run build</code>.</p>
              <p><a href="/api/health" style="color: #6366f1;">Check /api/health</a> | <a href="/api/scholarships" style="color: #6366f1;">Browse /api/scholarships</a></p>
            </body>
          </html>
        `);
      }
    });
  });

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
