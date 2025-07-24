import React, { useState, useEffect } from 'react';
import { databaseAPI } from '../api/database';
import './DatabasePage.css';

const DatabasePage = () => {
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTable, setSelectedTable] = useState('user');

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [infoData, summaryData] = await Promise.all([
        databaseAPI.getDatabaseInfo(),
        databaseAPI.getDatabaseSummary()
      ]);
      
      // Check if the responses are valid
      if (infoData && !infoData.error) {
        setDatabaseInfo(infoData);
      } else {
        throw new Error(infoData?.error || 'Invalid database info response');
      }
      
      if (summaryData && !summaryData.error) {
        setSummary(summaryData);
      } else {
        console.warn('Summary data error:', summaryData?.error);
        setSummary(null);
      }
      
    } catch (err) {
      setError(`Failed to load database information: ${err.message}`);
      console.error('Database loading error:', err);
      setDatabaseInfo(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await databaseAPI.exportDatabase();
      alert(`Database exported successfully to ${result.filename}`);
    } catch (err) {
      alert('Failed to export database');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getColumnTypeColor = (type) => {
    if (type.includes('INTEGER')) return '#4CAF50';
    if (type.includes('VARCHAR')) return '#2196F3';
    if (type.includes('DATETIME')) return '#FF9800';
    return '#9E9E9E';
  };

  if (loading) {
    return (
      <div className="database-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading database information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="database-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadDatabaseData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="database-page">
      <div className="database-header">
        <h1>Database Dashboard</h1>
        <div className="header-actions">
          <button onClick={loadDatabaseData} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={handleExport} className="export-btn">
            📁 Export JSON
          </button>
        </div>
      </div>

      {databaseInfo && databaseInfo.statistics ? (
        <div className="database-info">
          <div className="info-cards">
            <div className="info-card">
              <h3>Database</h3>
              <p><strong>Name:</strong> {databaseInfo.database_name || 'N/A'}</p>
              <p><strong>Type:</strong> {databaseInfo.database_type || 'N/A'}</p>
              <p><strong>Last Updated:</strong> {formatDate(databaseInfo.last_updated)}</p>
            </div>
            <div className="info-card">
              <h3>Statistics</h3>
              <p><strong>Total Tables:</strong> {databaseInfo.statistics?.total_tables || 0}</p>
              <p><strong>Total Users:</strong> {databaseInfo.statistics?.total_users || 0}</p>
              <p><strong>Total OTP Tokens:</strong> {databaseInfo.statistics?.total_otp_tokens || 0}</p>
            </div>
          </div>

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'schema' ? 'active' : ''}`}
              onClick={() => setActiveTab('schema')}
            >
              Schema
            </button>
            <button 
              className={`tab ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </button>
            <button 
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Recent Activity
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && databaseInfo.schema && databaseInfo.schema.tables && (
              <div className="overview-content">
                <div className="table-overview">
                  {Object.entries(databaseInfo.schema.tables).map(([tableName, tableInfo]) => (
                    <div key={tableName} className="table-card">
                      <h3>{tableName.toUpperCase()} Table</h3>
                      <p><strong>Rows:</strong> {tableInfo?.row_count || 0}</p>
                      <p><strong>Columns:</strong> {tableInfo?.columns?.length || 0}</p>
                      <div className="column-preview">
                        {tableInfo?.columns?.slice(0, 3).map((col, index) => (
                          <span key={index} className="column-tag" style={{backgroundColor: getColumnTypeColor(col.type)}}>
                            {col.name}
                          </span>
                        ))}
                        {tableInfo?.columns?.length > 3 && (
                          <span className="column-tag more">+{tableInfo.columns.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schema' && databaseInfo.schema && databaseInfo.schema.tables && (
              <div className="schema-content">
                <div className="table-selector">
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                    <option value="user">User Table</option>
                    <option value="otp_token">OTP Token Table</option>
                  </select>
                </div>
                <div className="schema-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Column Name</th>
                        <th>Type</th>
                        <th>Primary Key</th>
                        <th>Nullable</th>
                        <th>Unique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {databaseInfo.schema.tables[selectedTable]?.columns?.map((column, index) => (
                        <tr key={index}>
                          <td>{column.name}</td>
                          <td>
                            <span className="type-badge" style={{backgroundColor: getColumnTypeColor(column.type)}}>
                              {column.type}
                            </span>
                          </td>
                          <td>{column.primary_key ? '✓' : '✗'}</td>
                          <td>{column.nullable ? '✓' : '✗'}</td>
                          <td>{column.unique ? '✓' : '✗'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'data' && databaseInfo.data && (
              <div className="data-content">
                <div className="table-selector">
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                    <option value="user">User Table</option>
                    <option value="otp_token">OTP Token Table</option>
                  </select>
                </div>
                <div className="data-table">
                  {selectedTable === 'user' && databaseInfo.data.users && (
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Password Hash</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseInfo.data.users.map((user, index) => (
                          <tr key={index}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td className="hash-cell">{user.password_hash}</td>
                            <td>{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {selectedTable === 'otp_token' && databaseInfo.data.otp_tokens && (
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Token</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseInfo.data.otp_tokens.map((otp, index) => (
                          <tr key={index}>
                            <td>{otp.id}</td>
                            <td>{otp.email}</td>
                            <td className="token-cell">{otp.token}</td>
                            <td>{formatDate(otp.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && summary && (
              <div className="activity-content">
                <div className="activity-section">
                  <h3>Recent Users</h3>
                  <div className="activity-list">
                    {summary.recent_users?.map((user, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-details">
                          <p><strong>{user.name}</strong></p>
                          <p>{user.email}</p>
                          <small>{formatDate(user.created_at)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="activity-section">
                  <h3>Recent OTP Tokens</h3>
                  <div className="activity-list">
                    {summary.recent_otp_tokens?.map((otp, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">🔐</div>
                        <div className="activity-details">
                          <p><strong>{otp.email}</strong></p>
                          <p>Token: {otp.token}</p>
                          <small>{formatDate(otp.created_at)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="database-info">
          <div className="no-data-container">
            <h2>No Database Information Available</h2>
            <p>Unable to load database information. Please check your connection and try again.</p>
            <button onClick={loadDatabaseData} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabasePage; 