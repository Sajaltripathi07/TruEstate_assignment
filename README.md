# Retail Sales Management System

## Overview
A comprehensive full-stack retail sales management system that enables efficient search, filtering, sorting, and pagination of sales transaction data. The system provides a clean, intuitive interface for managing and analyzing retail sales operations with real-time data processing capabilities.

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React, Vite, Axios
- **Database**: MongoDB Atlas
- **Styling**: CSS3 with modern design patterns

## Search Implementation Summary
Full-text search is implemented across Customer Name and Phone Number fields. The search is case-insensitive and uses MongoDB's regex operator with case-insensitive option for pattern matching. Search queries are processed server-side and work seamlessly with filters and sorting.

## Filter Implementation Summary
Multi-select filtering is implemented for Customer Region, Gender, Age Range, Product Category, Tags, Payment Method, and Date Range. Filters operate independently and can be combined. The backend processes multiple filter conditions using MongoDB query operators with $in for multi-select fields and $gte/$lte for ranges.

## Sorting Implementation Summary
Sorting is implemented for Date (newest first), Quantity, and Customer Name (A-Z). The sorting state is preserved when applying search and filters. Backend uses MongoDB's sort() method with appropriate 1/-1 ordering based on the selected sort option.

## Pagination Implementation Summary
Pagination is implemented with a page size of 10 items per page. The backend calculates total pages and returns paginated results using MongoDB's skip() and limit() methods. Pagination state is maintained alongside search, filter, and sort states. Navigation includes Previous/Next buttons and page number indicators.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales_db?retryWrites=true&w=majority
   DB_NAME=sales_db
   ```
   **For MongoDB Atlas**: Get your connection string from Atlas dashboard → Connect → Connect your application
   **For local MongoDB**: Use `mongodb://localhost:27017`
4. Run the seed script to import data: `npm run seed`
5. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server: `npm run dev`

### Running the Application
- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

"# TruEstate_assignment" 
