# Architecture Documentation

## Overview
The Retail Sales Management System is a full-stack application built with a clear separation between frontend and backend. The system follows a modular architecture with well-defined responsibilities for each component.

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Data Import**: CSV parser for bulk data loading

### Folder Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   └── salesController.js
│   ├── services/        # Business logic
│   │   └── salesService.js
│   ├── routes/          # API route definitions
│   │   └── salesRoutes.js
│   ├── models/          # Database models
│   │   └── salesModel.js    # Sales collection operations
│   ├── utils/           # Utility functions
│   │   ├── database.js      # MongoDB connection
│   │   └── seedDatabase.js  # CSV import script
│   └── index.js         # Application entry point
├── package.json
└── README.md
```

### Module Responsibilities

#### Controllers (`controllers/salesController.js`)
- Handle HTTP requests and responses
- Parse and validate query parameters
- Transform array parameters from query strings
- Call service layer methods
- Handle errors and return appropriate HTTP status codes

#### Services (`services/salesService.js`)
- Contain all business logic
- Build dynamic MongoDB queries based on filters
- Handle complex filtering, searching, and sorting
- Calculate pagination parameters
- Aggregate metrics data using aggregation pipelines
- Extract filter options from database

#### Routes (`routes/salesRoutes.js`)
- Define API endpoints
- Map HTTP methods to controller functions
- Handle route-level middleware if needed

#### Models (`models/salesModel.js`)
- Define collection operations
- Create database indexes
- Provide collection access methods

#### Database Utils (`utils/database.js`)
- Manage MongoDB connection
- Provide reusable database connection instance
- Handle connection errors
- Support MongoDB Atlas connection strings

#### Seed Script (`utils/seedDatabase.js`)
- Parse CSV file and import data
- Transform CSV data to MongoDB documents
- Handle bulk insert operations efficiently
- Create necessary indexes for performance

### API Endpoints

#### GET /api/sales
Retrieves paginated sales data with support for:
- Search (customer name, phone number)
- Multi-select filters (regions, genders, categories, tags, payment methods)
- Range filters (age, date)
- Sorting (date, quantity, customer name)
- Pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search query
- `regions`: Comma-separated regions
- `genders`: Comma-separated genders
- `ageMin`: Minimum age
- `ageMax`: Maximum age
- `categories`: Comma-separated categories
- `tags`: Comma-separated tags
- `paymentMethods`: Comma-separated payment methods
- `dateFrom`: Start date (YYYY-MM-DD)
- `dateTo`: End date (YYYY-MM-DD)
- `sortBy`: Sort field (date, quantity, customerName)
- `sortOrder`: Sort order (asc, desc)

#### GET /api/sales/metrics
Returns aggregated metrics:
- Total units sold
- Total amount
- Total discount
- Total sales representatives

#### GET /api/sales/filter-options
Returns available options for all filters:
- Regions
- Genders
- Categories
- Tags
- Payment methods
- Age range (min/max)
- Date range (min/max)

### Database Schema

#### Sales Collection
MongoDB uses a document-based schema. Each sales document contains:

```javascript
{
  transactionId: Number,
  date: String (ISO date),
  customerId: String,
  customerName: String,
  phoneNumber: String,
  gender: String,
  age: Number,
  customerRegion: String,
  customerType: String,
  productId: String,
  productName: String,
  brand: String,
  productCategory: String,
  tags: String (comma-separated),
  quantity: Number,
  pricePerUnit: Number,
  discountPercentage: Number,
  totalAmount: Number,
  finalAmount: Number,
  paymentMethod: String,
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String
}
```

#### Indexes
MongoDB indexes are created automatically for:
- `customerName`: Text index for search performance
- `phoneNumber`: Text index for search performance
- `date`: For date filtering and sorting
- `customerRegion`: For region filtering
- `gender`: For gender filtering
- `productCategory`: For category filtering
- `paymentMethod`: For payment method filtering
- `age`: For age range filtering
- `quantity`: For quantity sorting

### Data Flow

1. **Request Flow**:
   ```
   Client Request → Express Router → Controller → Service → Database → Response
   ```

2. **Search Flow**:
   - User enters search query
   - Frontend sends request with `search` parameter
   - Backend builds MongoDB query with `$regex` and `$options: 'i'` for case-insensitive search on customerName and phoneNumber
   - Results filtered and returned

3. **Filter Flow**:
   - User selects filter options
   - Frontend sends comma-separated values
   - Backend parses and builds MongoDB query with `$in` operators for multi-select
   - Range filters use `$gte` and `$lte` operators
   - Multiple filters combined with AND logic (implicit in MongoDB queries)

4. **Sort Flow**:
   - User selects sort option
   - Backend builds MongoDB sort object with 1 (asc) or -1 (desc)
   - Results sorted before pagination using `.sort()`

5. **Pagination Flow**:
   - Backend calculates total count using `countDocuments()`
   - Applies `.skip()` and `.limit()` methods
   - Returns paginated data with metadata

## Frontend Architecture

### Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 (Component-scoped)

### Folder Structure
```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Sidebar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SortDropdown.jsx
│   │   ├── SalesMetrics.jsx
│   │   ├── SalesTable.jsx
│   │   ├── Pagination.jsx
│   │   └── *.css        # Component styles
│   ├── services/         # API service layer
│   │   └── api.js
│   ├── styles/          # Global styles
│   │   ├── index.css
│   │   └── App.css
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Component Responsibilities

#### App.jsx
- Main application container
- Manages global state (filters, search, pagination, sort)
- Coordinates data fetching
- Handles state updates and side effects

#### Sidebar.jsx
- Navigation component
- Displays vault section and user info
- Shows expandable sections (Services, Invoices)
- Manages local UI state for expansions

#### SearchBar.jsx
- Search input component
- Handles search query input
- Triggers search on change

#### FilterPanel.jsx
- Multi-select filter component
- Handles multiple filter types:
  - Multi-select (regions, genders, categories, tags, payment methods)
  - Range inputs (age, date)
- Manages expanded/collapsed state per filter
- Updates parent state on filter changes

#### SortDropdown.jsx
- Sort selection component
- Provides sort options (date, quantity, customer name)
- Handles sort direction (asc/desc)

#### SalesMetrics.jsx
- Displays aggregated metrics
- Formats currency values
- Shows total units, amount, discount

#### SalesTable.jsx
- Displays sales data in table format
- Handles loading and empty states
- Formats dates and currency
- Responsive table design

#### Pagination.jsx
- Pagination controls
- Shows page numbers (max 5 visible)
- Previous/Next navigation
- Highlights current page

### Service Layer (`services/api.js`)
- Centralized API communication
- Axios instance configuration
- API method exports:
  - `fetchSales()`: Get paginated sales data
  - `fetchMetrics()`: Get aggregated metrics
  - `fetchFilterOptions()`: Get available filter options

### State Management

#### Global State (App.jsx)
- `sales`: Array of sales records
- `metrics`: Aggregated metrics object
- `filterOptions`: Available filter options
- `loading`: Loading state
- `pagination`: Pagination metadata
- `search`: Search query string
- `filters`: Filter values object
- `sortBy`: Current sort field
- `sortOrder`: Current sort order

#### State Updates
- Search changes reset to page 1
- Filter changes reset to page 1
- Sort changes reset to page 1
- Page changes maintain filters/search/sort

### Data Flow

1. **Initial Load**:
   ```
   App mounts → Load filter options → Load sales data → Load metrics
   ```

2. **Search Flow**:
   ```
   User types → SearchBar onChange → App state update → useEffect → API call → Update sales
   ```

3. **Filter Flow**:
   ```
   User selects filter → FilterPanel onChange → App state update → useEffect → API call → Update sales & metrics
   ```

4. **Sort Flow**:
   ```
   User selects sort → SortDropdown onChange → App state update → useEffect → API call → Update sales
   ```

5. **Pagination Flow**:
   ```
   User clicks page → Pagination onClick → App state update → useEffect → API call → Update sales
   ```

### UI/UX Design

#### Layout Structure
- Fixed sidebar (250px width)
- Main content area (flexible width)
- Responsive design considerations

#### Component Styling
- Component-scoped CSS files
- Consistent color scheme
- Modern, clean design
- Hover states and transitions
- Accessible form controls

#### Design Patterns
- Collapsible filter sections
- Multi-select checkboxes
- Range inputs for numeric/date filters
- Table with hover effects
- Pagination with active state

## Integration Points

### Frontend-Backend Communication
- RESTful API over HTTP
- JSON request/response format
- Query parameters for filtering/searching
- CORS enabled for cross-origin requests

### Error Handling
- Backend: Try-catch blocks in controllers
- Frontend: Error handling in API service
- User-friendly error messages
- Graceful degradation

### Performance Considerations
- Database indexes for fast queries
- Pagination to limit data transfer
- Efficient MongoDB query building
- Batch processing for CSV import (5000 documents per batch)
- React useEffect optimization
- MongoDB aggregation pipelines for metrics calculation

## Deployment Considerations

### Backend
- Environment variables for configuration
- Database connection pooling
- Error logging
- Health check endpoint

### Frontend
- Environment variables for API URL
- Production build optimization
- Static asset serving
- Proxy configuration for development

## Security Considerations
- NoSQL injection prevention (using MongoDB operators safely)
- Input validation
- CORS configuration
- Environment variable protection
- No sensitive data in frontend code
- MongoDB Atlas network access controls

