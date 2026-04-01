import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { staff as staffApi } from "../../services/api";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await staffApi.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="staff-loading">
        <div className="staff-spinner"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Customers Handled Today", value: stats?.today?.customers || 0, icon: "👥", color: "blue" },
    { label: "Today's Deposits", value: formatCurrency(stats?.today?.deposits || 0), icon: "📥", color: "green" },
    { label: "Today's Withdrawals", value: formatCurrency(stats?.today?.withdrawals || 0), icon: "📤", color: "red" },
    { label: "Today's Transactions", value: stats?.today?.transactions || 0, icon: "💳", color: "purple" },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>
          Welcome back, {user.firstName}!
        </h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>
          Here's your daily overview • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="staff-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="staff-stat-card">
            <div className={`staff-stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="staff-stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="staff-card">
          <div className="staff-card-header">
            <h3 className="staff-card-title">Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <div className="quick-action-btn" onClick={() => navigate('/staff/operations?action=deposit')}>
              <span className="quick-action-icon">📥</span>
              <span className="quick-action-label">Deposit</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigate('/staff/operations?action=withdraw')}>
              <span className="quick-action-icon">📤</span>
              <span className="quick-action-label">Withdraw</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigate('/staff/operations?action=account')}>
              <span className="quick-action-icon">🏦</span>
              <span className="quick-action-label">Open Account</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigate('/staff/operations?action=transfer')}>
              <span className="quick-action-icon">↔️</span>
              <span className="quick-action-label">Transfer</span>
            </div>
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card-header">
            <h3 className="staff-card-title">Pending Tasks</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/staff/kyc')}>
              <span>Pending KYC Verifications</span>
              <span className="staff-badge badge-warning">{stats?.pending?.kyc || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }} onClick={() => navigate('/staff/complaints')}>
              <span>Unresolved Complaints</span>
              <span className="staff-badge badge-danger">{stats?.pending?.complaints || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-card-header">
          <h3 className="staff-card-title">Recent Transactions</h3>
          <button className="staff-btn staff-btn-secondary staff-btn-sm" onClick={() => navigate('/staff/transactions')}>View All</button>
        </div>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentTransactions?.slice(0, 5).map((txn) => (
              <tr key={txn._id}>
                <td>{txn.user?.firstName} {txn.user?.lastName}</td>
                <td style={{ textTransform: 'capitalize' }}>{txn.type || txn.category}</td>
                <td style={{ color: txn.type === 'withdrawal' ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                  {txn.type === 'withdrawal' ? '-' : '+'}{formatCurrency(txn.amount)}
                </td>
                <td>{formatDate(txn.createdAt)}</td>
                <td>
                  <span className={`staff-badge badge-${txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'danger'}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <tr>
                <td colSpan="5" className="staff-empty">No recent transactions</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;
