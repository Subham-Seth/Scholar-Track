import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '⚠️ [DB WARNING] MONGODB_URI is not set in environment variables. Database features will be unavailable until configured.'
    );
    return false;
  }

  try {
    // Mask sensitive credentials when logging
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ [DB SUCCESS] MongoDB Connected successfully.');
    return true;
  } catch (error: any) {
    console.error('❌ [DB ERROR] MongoDB connection failed:', error.message);
    console.warn(
      '⚠️ App will start, but database-dependent features will return appropriate connection status responses.'
    );
    return false;
  }
};

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
