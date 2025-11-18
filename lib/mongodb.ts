import mongoose from 'mongoose';

// Define the MongoDB connection string type
const MONGODB_URI: string = process.env.MONGODB_URI || '';

// Validate that the MongoDB URI is provided
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Define the shape of the cached connection object
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize the cache on the global object to preserve it across hot reloads in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * 
 * This function implements connection caching to prevent multiple connections
 * during development hot reloads and serverless function invocations.
 * 
 * @returns A promise that resolves to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // If a connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't exist, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering to fail fast in serverless environments
    };

    // Create and cache the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise on error to allow retries
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

export default connectDB;
