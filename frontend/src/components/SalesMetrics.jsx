import './SalesMetrics.css';

function SalesMetrics({ metrics }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="sales-metrics">
      <div className="metric-card">
        <div className="metric-label">Total units sold:</div>
        <div className="metric-value">{metrics.totalUnits || 0}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total Amount:</div>
        <div className="metric-value">
          {formatCurrency(metrics.totalAmount || 0)}
          {metrics.totalSalesReps > 0 && (
            <span className="metric-subtext"> ({metrics.totalSalesReps} SRs)</span>
          )}
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total Discount:</div>
        <div className="metric-value">
          {formatCurrency(metrics.totalDiscount || 0)}
          {metrics.totalSalesReps > 0 && (
            <span className="metric-subtext"> ({metrics.totalSalesReps} SRs)</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesMetrics;

