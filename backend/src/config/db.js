import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const getIsInMemory = () => Boolean(mongoMemoryServerInstance);

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillwave';

  try {
    // Set 3 second timeout for initial connection attempt to localhost
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully (PERSISTENT): ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary persistent URI (${uri}): ${err.message}`);
    
    // Fallback to MongoMemoryServer for standalone/testing if persistent DB unavailable
    try {
      console.warn('⚠️  [MongoDB WARNING] Initializing fallback in-memory MongoDB instance. Data will NOT persist across restarts!');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to fallback in-memory instance at ${memoryUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error(`[MongoDB] Fatal error initializing database:`, fallbackErr.message);
      throw fallbackErr;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
