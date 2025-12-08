import { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({ filters, filterOptions, onChange }) {
  const [expandedFilters, setExpandedFilters] = useState({});

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleMultiSelect = (filterName, value) => {
    const currentValues = filters[filterName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onChange(filterName, newValues);
  };

  const handleRangeChange = (filterName, subField, value) => {
    onChange(filterName, {
      ...filters[filterName],
      [subField]: value
    });
  };

  const handleSingleRange = (filterName, value) => {
    onChange(filterName, value);
  };

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('regions')}>
          Customer Region
          <span className="filter-icon">{expandedFilters.regions ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.regions && (
          <div className="filter-options">
            {filterOptions.regions.map(region => (
              <label key={region} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.regions?.includes(region) || false}
                  onChange={() => handleMultiSelect('regions', region)}
                />
                {region}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('genders')}>
          Gender
          <span className="filter-icon">{expandedFilters.genders ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.genders && (
          <div className="filter-options">
            {filterOptions.genders.map(gender => (
              <label key={gender} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.genders?.includes(gender) || false}
                  onChange={() => handleMultiSelect('genders', gender)}
                />
                {gender}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('ageRange')}>
          Age Range
          <span className="filter-icon">{expandedFilters.ageRange ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.ageRange && (
          <div className="filter-options range-filter">
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.ageMin || ''}
                onChange={(e) => handleSingleRange('ageMin', e.target.value)}
                min={filterOptions.ageRange.min}
                max={filterOptions.ageRange.max}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.ageMax || ''}
                onChange={(e) => handleSingleRange('ageMax', e.target.value)}
                min={filterOptions.ageRange.min}
                max={filterOptions.ageRange.max}
              />
            </div>
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('categories')}>
          Product Category
          <span className="filter-icon">{expandedFilters.categories ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.categories && (
          <div className="filter-options">
            {filterOptions.categories.map(category => (
              <label key={category} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category) || false}
                  onChange={() => handleMultiSelect('categories', category)}
                />
                {category}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('tags')}>
          Tags
          <span className="filter-icon">{expandedFilters.tags ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.tags && (
          <div className="filter-options">
            {filterOptions.tags.map(tag => (
              <label key={tag} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.tags?.includes(tag) || false}
                  onChange={() => handleMultiSelect('tags', tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('paymentMethods')}>
          Payment Method
          <span className="filter-icon">{expandedFilters.paymentMethods ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.paymentMethods && (
          <div className="filter-options">
            {filterOptions.paymentMethods.map(method => (
              <label key={method} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.paymentMethods?.includes(method) || false}
                  onChange={() => handleMultiSelect('paymentMethods', method)}
                />
                {method}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-label" onClick={() => toggleFilter('dateRange')}>
          Date
          <span className="filter-icon">{expandedFilters.dateRange ? '▼' : '▶'}</span>
        </div>
        {expandedFilters.dateRange && (
          <div className="filter-options range-filter">
            <div className="range-inputs">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleSingleRange('dateFrom', e.target.value)}
                max={filterOptions.dateRange.max}
              />
              <span>to</span>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleSingleRange('dateTo', e.target.value)}
                min={filters.dateFrom || filterOptions.dateRange.min}
                max={filterOptions.dateRange.max}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterPanel;

