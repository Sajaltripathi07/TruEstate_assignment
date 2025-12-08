import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import SalesMetrics from './components/SalesMetrics';
import SalesTable from './components/SalesTable';
import Pagination from './components/Pagination';
import SortDropdown from './components/SortDropdown';
import { fetchSales, fetchMetrics, fetchFilterOptions } from './services/api';
import './styles/App.css';

function App() {
  const [sales, setSales] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalSalesReps: 0
  });
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: [],
    ageRange: { min: 0, max: 100 },
    dateRange: { min: null, max: null }
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    regions: [],
    genders: [],
    ageMin: '',
    ageMax: '',
    categories: [],
    tags: [],
    paymentMethods: [],
    dateFrom: '',
    dateTo: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadSales();
    loadMetrics();
  }, [pagination.page, search, filters, sortBy, sortOrder]);

  const loadFilterOptions = async () => {
    try {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
      if (options.dateRange.min && options.dateRange.max) {
        setFilters(prev => ({
          ...prev,
          dateFrom: options.dateRange.min,
          dateTo: options.dateRange.max
        }));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filters,
        sortBy,
        sortOrder
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await fetchSales(params);
      setSales(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await fetchMetrics(params);
      setMetrics(response);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <div className="content-header">
          <h1>Sales Management System</h1>
        </div>
        <div className="content-body">
          <SearchBar value={search} onChange={handleSearch} />
          <div className="filters-row">
            <FilterPanel
              filters={filters}
              filterOptions={filterOptions}
              onChange={handleFilterChange}
            />
            <SortDropdown
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
          </div>
          <SalesMetrics metrics={metrics} />
          <SalesTable sales={sales} loading={loading} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

