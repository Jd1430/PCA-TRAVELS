import React, { useState } from 'react';

const AdminDashboardTabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = React.Children.map(children, child => child.props.label);

  return (
    <div className="admin-dashboard-tabs">
      <div className="tab-header">
        {tabLabels.map((label, idx) => (
          <button
            key={label}
            className={activeTab === idx ? 'active' : ''}
            onClick={() => setActiveTab(idx)}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div className="tab-content">
          {children[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTabs; 