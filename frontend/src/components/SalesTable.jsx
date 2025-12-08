import './SalesTable.css';

function SalesTable({ sales, loading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="sales-table-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="sales-table-container">
        <div className="no-results">No sales data found</div>
      </div>
    );
  }

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.transactionId}>
              <td>{sale.transactionId}</td>
              <td>{formatDate(sale.date)}</td>
              <td>{sale.customerId}</td>
              <td>{sale.customerName}</td>
              <td>
                <span className="phone-number">{sale.phoneNumber}</span>
                <span className="eye-icon">👁</span>
              </td>
              <td>{sale.gender}</td>
              <td>{sale.age}</td>
              <td>{sale.productCategory}</td>
              <td>{sale.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesTable;

