import fs from 'fs';
import csv from 'csv-parser';
import { connectToDatabase, closeDatabase } from './database.js';
import { insertSales, createIndexes, getSalesCollection } from '../models/salesModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '../../../dataset.csv');
    
    console.log('Reading CSV file...');
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        console.log(`Loaded ${results.length} records from CSV`);
        
        try {
          await connectToDatabase();
          
          // Clear existing collection
          const { getDatabase } = await import('../models/salesModel.js');
          const collection = await getSalesCollection();
          await collection.deleteMany({});
          console.log('Cleared existing sales collection');
          
          // Transform CSV data to MongoDB documents
          const documents = results.map(row => ({
            transactionId: parseInt(row['Transaction ID']) || null,
            date: row['Date'] || null,
            customerId: row['Customer ID'] || null,
            customerName: row['Customer Name'] || null,
            phoneNumber: row['Phone Number'] || null,
            gender: row['Gender'] || null,
            age: row['Age'] ? parseInt(row['Age']) : null,
            customerRegion: row['Customer Region'] || null,
            customerType: row['Customer Type'] || null,
            productId: row['Product ID'] || null,
            productName: row['Product Name'] || null,
            brand: row['Brand'] || null,
            productCategory: row['Product Category'] || null,
            tags: row['Tags'] || null,
            quantity: row['Quantity'] ? parseInt(row['Quantity']) : null,
            pricePerUnit: row['Price per Unit'] ? parseFloat(row['Price per Unit']) : null,
            discountPercentage: row['Discount Percentage'] ? parseFloat(row['Discount Percentage']) : null,
            totalAmount: row['Total Amount'] ? parseFloat(row['Total Amount']) : null,
            finalAmount: row['Final Amount'] ? parseFloat(row['Final Amount']) : null,
            paymentMethod: row['Payment Method'] || null,
            orderStatus: row['Order Status'] || null,
            deliveryType: row['Delivery Type'] || null,
            storeId: row['Store ID'] || null,
            storeLocation: row['Store Location'] || null,
            salespersonId: row['Salesperson ID'] || null,
            employeeName: row['Employee Name'] || null
          }));

          // Insert in batches for better performance
          console.log('Starting bulk insert...');
          const batchSize = 1000; // Reduced batch size to avoid memory issues
          let inserted = 0;
          let errors = 0;
          
          for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            try {
              const result = await insertSales(batch);
              const count = result.insertedCount || batch.length;
              inserted += count;
              console.log(`Inserted ${inserted}/${documents.length} records... (${Math.round((inserted/documents.length)*100)}%)`);
            } catch (error) {
              // Continue with next batch if there are duplicate key errors or write errors
              if (error.code === 11000 || error.writeErrors) {
                const insertedInBatch = error.insertedIds ? Object.keys(error.insertedIds).length : 0;
                inserted += insertedInBatch;
                errors += (batch.length - insertedInBatch);
                console.log(`Batch ${i}-${i+batch.length}: Inserted ${insertedInBatch}, skipped ${batch.length - insertedInBatch} duplicates/errors`);
              } else {
                console.error(`Error inserting batch ${i}-${i+batch.length}:`, error.message);
                errors += batch.length;
              }
            }
          }
          
          if (errors > 0) {
            console.log(`\n⚠️  Warning: ${errors} documents had errors (likely duplicates)`);
          }
          
          // Create indexes after data insertion
          console.log('\nCreating indexes...');
          try {
            await createIndexes();
          } catch (indexError) {
            console.warn('Some indexes may not have been created:', indexError.message);
            console.warn('This is usually okay - the application will still work');
          }
          
          console.log('\n✅ Data import completed successfully!');
          console.log(`   Total records processed: ${documents.length}`);
          console.log(`   Successfully inserted: ${inserted}`);
          if (errors > 0) {
            console.log(`   Errors/duplicates: ${errors}`);
          }
          await closeDatabase();
          resolve();
        } catch (error) {
          console.error('Error importing data:', error);
          await closeDatabase();
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    console.log('Importing CSV data...');
    await importCSV();
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

seed();
