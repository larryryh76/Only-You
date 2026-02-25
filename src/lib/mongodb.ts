import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Attempting to connect to MongoDB...');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('MongoDB connection error:', message);

    if (message.includes('authentication failed') || message.includes('bad auth')) {
      throw new Error(`Database connection failed: Authentication failed. If using MongoDB Atlas, ensure your password is URL-encoded (e.g., replace @ with %40).`);
    }

    throw new Error(`Database connection failed: ${message}`);
  }

  return cached.conn;
}

export default dbConnect;
