import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import salesRoutes from './routes/salesRoutes.js';
import { connectToDatabase } from './utils/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('Server will start but database operations will fail');
  });

// Routes
app.use('/api/sales', salesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sales Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

