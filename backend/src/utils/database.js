import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'sales_db';

console.log('MongoDB Configuration:');
console.log('  DB_NAME:', DB_NAME);
console.log('  MONGODB_URI:', MONGODB_URI ? `${MONGODB_URI.substring(0, 20)}...` : 'NOT SET');

let client = null;
let db = null;

export async function connectToDatabase() {
  if (client && db) {
    return { client, db };
  }

  if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017') {
    console.error(' MONGODB_URI is not set in .env file!');
    console.error('Please set MONGODB_URI in backend/.env file');
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    
    db = client.db(DB_NAME);
    console.log(' Connected to MongoDB successfully!');
    console.log('  Database:', DB_NAME);
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:');
    console.error('  Error message:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('  → Check your username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('  → Check your MongoDB cluster URL/hostname');
    } else if (error.message.includes('timeout')) {
      console.error('  → Check your network connection and IP whitelist in MongoDB Atlas');
    } else if (error.message.includes('MongoServerError')) {
      console.error('  → MongoDB server error. Check your connection string format');
    }
    
    throw error;
  }
}

export async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

export default { connectToDatabase, getDatabase, closeDatabase };
