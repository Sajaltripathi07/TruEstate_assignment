import './SortDropdown.css';

function SortDropdown({ sortBy, sortOrder, onChange }) {
  const handleChange = (e) => {
    const value = e.target.value;
    let field = 'date';
    let order = 'desc';

    switch (value) {
      case 'date-desc':
        field = 'date';
        order = 'desc';
        break;
      case 'date-asc':
        field = 'date';
        order = 'asc';
        break;
      case 'quantity-desc':
        field = 'quantity';
        order = 'desc';
        break;
      case 'quantity-asc':
        field = 'quantity';
        order = 'asc';
        break;
      case 'customerName-asc':
        field = 'customerName';
        order = 'asc';
        break;
      case 'customerName-desc':
        field = 'customerName';
        order = 'desc';
        break;
      default:
        field = 'date';
        order = 'desc';
    }

    onChange(field, order);
  };

  const getCurrentValue = () => {
    return `${sortBy}-${sortOrder}`;
  };

  return (
    <div className="sort-dropdown">
      <label>Sort by:</label>
      <select value={getCurrentValue()} onChange={handleChange}>
        <option value="date-desc">Date (Newest First)</option>
        <option value="date-asc">Date (Oldest First)</option>
        <option value="quantity-desc">Quantity (High to Low)</option>
        <option value="quantity-asc">Quantity (Low to High)</option>
        <option value="customerName-asc">Customer Name (A-Z)</option>
        <option value="customerName-desc">Customer Name (Z-A)</option>
      </select>
    </div>
  );
}

export default SortDropdown;

