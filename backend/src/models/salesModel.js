import { getDatabase } from '../utils/database.js';

const COLLECTION_NAME = 'sales';

export async function createIndexes() {
  try {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    
    // Drop existing indexes first (except _id)
    try {
      const existingIndexes = await collection.indexes();
      for (const index of existingIndexes) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
          } catch (err) {
            // Ignore errors if index doesn't exist
          }
        }
      }
    } catch (err) {
      // Ignore if no indexes exist
    }
    
    // Create indexes for better query performance
    // Note: MongoDB allows only one text index per collection
    // We'll create a compound text index for search, and regular indexes for filtering/sorting
    try {
      await collection.createIndex({ customerName: 'text', phoneNumber: 'text' }, { name: 'text_search_index' });
    } catch (err) {
      console.warn('Text index creation skipped (may already exist or conflict):', err.message);
    }
    
    // Create regular indexes for filtering and sorting (these work alongside text index)
    await collection.createIndex({ date: -1 });
    await collection.createIndex({ customerRegion: 1 });
    await collection.createIndex({ gender: 1 });
    await collection.createIndex({ productCategory: 1 });
    await collection.createIndex({ paymentMethod: 1 });
    await collection.createIndex({ age: 1 });
    await collection.createIndex({ quantity: -1 });
    await collection.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ date: -1 });
    await collection.createIndex({ customerRegion: 1 });
    await collection.createIndex({ gender: 1 });
    await collection.createIndex({ productCategory: 1 });
    await collection.createIndex({ paymentMethod: 1 });
    await collection.createIndex({ age: 1 });
    await collection.createIndex({ quantity: -1 });
    await collection.createIndex({ transactionId: 1 }, { unique: true });
    
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
    // Don't throw - indexes are optional for basic functionality
    console.warn('Continuing without some indexes...');
  }
}

export async function insertSales(salesData) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  if (Array.isArray(salesData)) {
    // Use ordered: false to continue on errors, and handle duplicates
    try {
      return await collection.insertMany(salesData, { 
        ordered: false,
        writeConcern: { w: 1 }
      });
    } catch (error) {
      // If some documents were inserted, that's okay
      if (error.writeErrors && error.insertedIds) {
        const insertedCount = Object.keys(error.insertedIds).length;
        console.log(`Inserted ${insertedCount} out of ${salesData.length} documents in this batch`);
        return { insertedCount, acknowledged: true };
      }
      throw error;
    }
  } else {
    return await collection.insertOne(salesData);
  }
}

export async function getSalesCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION_NAME);
}

