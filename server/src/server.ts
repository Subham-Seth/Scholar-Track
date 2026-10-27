import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { Scholarship } from './models/Scholarship.js';
import { seedScholarshipsData } from './config/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from cwd, server/.env, or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const app = createApp();

  // Connect to MongoDB
  const connected = await connectDB();

  // If connected, check if scholarships collection is empty; if so, auto-populate demonstration records
  if (connected) {
    try {
      const count = await Scholarship.countDocuments();
      if (count === 0) {
        console.log('🌱 Scholarships collection is empty. Populating initial demonstration scholarships...');
        await Scholarship.insertMany(seedScholarshipsData);
        console.log(`✅ Loaded ${seedScholarshipsData.length} demonstration scholarships.`);
      } else {
        console.log(`📚 Database contains ${count} scholarship records ready for queries.`);
      }
    } catch (e: any) {
      console.warn('⚠️ Auto-seed check warning:', e.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Scholar-Track Backend API Server is running!`);
    console.log(`📍 Local URL:     http://localhost:${PORT}`);
    console.log(`🩺 Health check:  http://localhost:${PORT}/api/health`);
    console.log(`🎓 Scholarships:  http://localhost:${PORT}/api/scholarships`);
    console.log(`🤖 AI Engine:     ${process.env.GEMINI_API_KEY ? 'Google Gemini' : 'Intelligent Knowledge Engine'}`);
    console.log(`🔒 Security:      CORS, Helmet, Rate Limiter Active`);
    console.log(`====================================================`);
  });

  const gracefulShutdown = () => {
    console.log('\nStopping Scholar-Track server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
