import fs from 'fs';
import https from 'https';
import csv from 'csv-parser';
import { connectToDatabase, closeDatabase } from './database.js';
import { insertSales, createIndexes, getSalesCollection } from '../models/salesModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DRIVE_URL = 'https://drive.usercontent.google.com/uc?id=1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb&export=download';
const driveUrl = process.env.DRIVE_CSV_URL || DEFAULT_DRIVE_URL;
const localCsvPath = path.join(__dirname, '../../../dataset.csv');
const downloadedCsvPath = path.join(__dirname, '../../../dataset_drive.csv');

function looksLikeHtml(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(512);
    const bytes = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    const head = buffer.toString('utf8', 0, bytes).toLowerCase();
    return head.includes('<html') || head.includes('google drive') || head.includes('signin');
  } catch (err) {
    return false;
  }
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          downloadFile(response.headers.location, destination).then(resolve).catch(reject);
          return;
        }

        let downloaded = 0;
        const total = parseInt(response.headers['content-length'] || '0', 10);

        response.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total > 0 && downloaded % (5 * 1024 * 1024) < chunk.length) {
            const percent = ((downloaded / total) * 100).toFixed(1);
            process.stdout.write(`\rDownloading CSV... ${percent}%`);
          }
        });

        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            if (total > 0) {
              process.stdout.write('\rDownloading CSV... 100%\n');
            } else {
              console.log('Download complete');
            }
            resolve(destination);
          });
        });
      })
      .on('error', (err) => {
        fs.unlink(destination, () => reject(err));
      });
  });
}

async function getCsvPath() {
  try {
    console.log('Attempting to download CSV from Google Drive...');
    await downloadFile(driveUrl, downloadedCsvPath);
    if (looksLikeHtml(downloadedCsvPath)) {
      throw new Error('Downloaded content looks like HTML (auth/confirm page). Provide a direct download link via DRIVE_CSV_URL.');
    }
    console.log('CSV downloaded from Drive');
    return downloadedCsvPath;
  } catch (err) {
    console.warn('Failed to download from Google Drive, falling back to local dataset.csv:', err.message);
    return localCsvPath;
  }
}

async function importCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPathPromise = getCsvPath();
    let rowCount = 0;
    
    console.log('Reading CSV file...');
    console.log('This may take a while for large files...');

    csvPathPromise
      .then((csvPath) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
            rowCount++;
            if (rowCount % 10000 === 0) {
              process.stdout.write(`\rReading CSV... ${rowCount.toLocaleString()} records loaded`);
            }
          })
          .on('end', async () => {
            console.log(`\nLoaded ${results.length.toLocaleString()} records from CSV`);
            
            try {
              await connectToDatabase();
              
              const { getDatabase } = await import('../models/salesModel.js');
              const collection = await getSalesCollection();
              await collection.deleteMany({});
              console.log('Cleared existing sales collection');
              
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
              
              console.log('Starting bulk insert...');
              const batchSize = 1000;
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
                console.log(`\n Warning: ${errors} documents had errors (likely duplicates)`);
              }
              
              console.log('\nCreating indexes...');
              try {
                await createIndexes();
              } catch (indexError) {
                console.warn('Some indexes may not have been created:', indexError.message);
                console.warn('This is usually okay - the application will still work');
              }
              
              console.log('\n Data import completed successfully!');
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
      })
      .catch((err) => {
        console.error('Error preparing CSV path:', err);
        reject(err);
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
