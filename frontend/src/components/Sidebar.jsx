import { useState } from 'react';
import './Sidebar.css';

function Sidebar() {
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [invoicesExpanded, setInvoicesExpanded] = useState(true);
  const [activeService, setActiveService] = useState('Active');
  const [activeInvoice, setActiveInvoice] = useState('Proforma Invoices');

  return (
    <div className="sidebar">
      
      <nav className="sidebar-nav">
        <a href="#" className="nav-item">Dashboard</a>
        <a href="#" className="nav-item">Nexus</a>
        <a href="#" className="nav-item">Intake</a>
      </nav>

      <div className="sidebar-section">
        <div 
          className="section-header"
          onClick={() => setServicesExpanded(!servicesExpanded)}
        >
          <span>Services</span>
          <span className="expand-icon">{servicesExpanded ? '−' : '+'}</span>
        </div>
        {servicesExpanded && (
          <div className="section-items">
            <div 
              className={`section-item ${activeService === 'Pre-active' ? 'active' : ''}`}
              onClick={() => setActiveService('Pre-active')}
            >
              <span className="radio-icon"></span>
              Pre-active
            </div>
            <div 
              className={`section-item ${activeService === 'Active' ? 'active' : ''}`}
              onClick={() => setActiveService('Active')}
            >
              <span className="radio-icon"></span>
              Active
            </div>
            <div 
              className={`section-item ${activeService === 'Blocked' ? 'active' : ''}`}
              onClick={() => setActiveService('Blocked')}
            >
              <span className="radio-icon"></span>
              Blocked
            </div>
            <div 
              className={`section-item ${activeService === 'Closed' ? 'active' : ''}`}
              onClick={() => setActiveService('Closed')}
            >
              <span className="radio-icon"></span>
              Closed
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div 
          className="section-header"
          onClick={() => setInvoicesExpanded(!invoicesExpanded)}
        >
          <span>Invoices</span>
          <span className="expand-icon">{invoicesExpanded ? '−' : '+'}</span>
        </div>
        {invoicesExpanded && (
          <div className="section-items">
            <div 
              className={`section-item ${activeInvoice === 'Proforma Invoices' ? 'active' : ''}`}
              onClick={() => setActiveInvoice('Proforma Invoices')}
            >
              <span className="radio-icon"></span>
              Proforma Invoices
            </div>
            <div 
              className={`section-item ${activeInvoice === 'Final Invoices' ? 'active' : ''}`}
              onClick={() => setActiveInvoice('Final Invoices')}
            >
              <span className="radio-icon"></span>
              Final Invoices
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;

