# Backend API

## Setup
1. Install dependencies: `npm install`
2. Configure `.env` file with MongoDB connection string:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales_db?retryWrites=true&w=majority
   DB_NAME=sales_db
   ```
   **For MongoDB Atlas**: Get your connection string from Atlas dashboard → Connect → Connect your application
   **For local MongoDB**: Use `mongodb://localhost:27017`
3. Run seed script: `npm run seed`
4. Start server: `npm run dev`

## API Endpoints

### GET /api/sales
Get paginated sales data with search, filter, sort, and pagination support.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `search` - Search query for customer name or phone number
- `regions` - Comma-separated list of regions
- `genders` - Comma-separated list of genders
- `ageMin` - Minimum age
- `ageMax` - Maximum age
- `categories` - Comma-separated list of product categories
- `tags` - Comma-separated list of tags
- `paymentMethods` - Comma-separated list of payment methods
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `sortBy` - Sort field (date, quantity, customerName)
- `sortOrder` - Sort order (asc, desc)

### GET /api/sales/metrics
Get aggregated sales metrics (total units, total amount, total discount).

### GET /api/sales/filter-options
Get available options for all filters (regions, genders, categories, tags, payment methods, age range, date range).
