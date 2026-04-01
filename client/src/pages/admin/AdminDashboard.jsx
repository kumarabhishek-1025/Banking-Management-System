import React, { useState, useEffect } from "react";
import { admin as adminApi } from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    
    const num = Math.abs(amount);
    
    if (num >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (num >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Customers", value: stats?.users?.total || 0, icon: "👥", color: "blue" },
    { label: "Total Accounts", value: stats?.accounts?.total || 0, icon: "🏦", color: "green" },
    { label: "Total Balance", value: formatCurrency(stats?.accounts?.totalBalance), icon: "💰", color: "yellow" },
    { label: "Active Accounts", value: stats?.accounts?.active || 0, icon: "✅", color: "green" },
    { label: "Pending Loans", value: stats?.loans?.pending || 0, icon: "⏳", color: "orange" },
    { label: "Loans Disbursed", value: formatCurrency(stats?.loans?.totalDisbursed), icon: "💵", color: "purple" },
    { label: "Pending KYC", value: stats?.kyc?.pending || 0, icon: "🆔", color: "orange" },
    { label: "Active FDs", value: stats?.investments?.fds?.count || 0, icon: "📈", color: "blue" },
    { label: "Active RDs", value: stats?.investments?.rds?.count || 0, icon: "📊", color: "purple" },
    { label: "Credit Cards", value: stats?.creditCards?.active || 0, icon: "💳", color: "red" },
  ];

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Admin Dashboard</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Overview of all banking operations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={loadDashboard}>🔄 Refresh</button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Transactions</h3>
            <a href="/admin/transactions" className="admin-btn admin-btn-secondary admin-btn-sm">View All</a>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions?.slice(0, 5).map((txn) => (
                <tr key={txn._id}>
                  <td>{txn.user?.firstName} {txn.user?.lastName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{txn.type || txn.category}</td>
                  <td style={{ color: txn.amount > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </td>
                  <td>
                    <span className={`admin-badge badge-${txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'danger'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td>{formatDate(txn.createdAt)}</td>
                </tr>
              ))}
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                <tr>
                  <td colSpan="5" className="admin-empty">No recent transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Quick Summary</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Deposits</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
                {formatCurrency(stats?.accounts?.totalBalance)}
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>This Month Credits</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
                {formatCurrency(stats?.transactions?.monthlyCredits)}
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>This Month Debits</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                {formatCurrency(stats?.transactions?.monthlyDebits)}
              </div>
            </div>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Transactions Today</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {stats?.transactions?.today || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>📊 Analytics Charts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          
          <div className="admin-card">
            <h4 style={{ margin: '0 0 1rem' }}>Monthly Transactions</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 150 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', background: 'linear-gradient(180deg, #667eea, #764ba2)', borderRadius: '4px 4px 0 0', height: `${[60, 75, 45, 90, 80, 100][i]}%`, minHeight: 20 }}></div>
                  <span style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: '#64748b' }}>{month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h4 style={{ margin: '0 0 1rem' }}>Deposit vs Withdrawal</h4>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', height: 150 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(#16a34a 0deg 216deg, #e2e8f0 216deg 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'white' }}></div>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>Deposits</p>
                <p style={{ margin: 0, color: '#16a34a', fontSize: '0.875rem' }}>60%</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(#dc2626 0deg 144deg, #e2e8f0 144deg 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'white' }}></div>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>Withdrawals</p>
                <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem' }}>40%</p>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h4 style={{ margin: '0 0 1rem' }}>User Growth</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 150 }}>
              {['W1', 'W2', 'W3', 'W4'].map((week, i) => (
                <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', background: '#22c55e', borderRadius: '4px 4px 0 0', height: `${[40, 60, 75, 100][i]}%`, minHeight: 15 }}></div>
                  <span style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: '#64748b' }}>{week}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Pending Approvals</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
              <span>Pending Loan Applications</span>
              <span className="admin-badge badge-warning">{stats?.loans?.pending || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
              <span>Pending KYC Verifications</span>
              <span className="admin-badge badge-warning">{stats?.kyc?.pending || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
              <span>Pending Accounts</span>
              <span className="admin-badge badge-warning">{stats?.accounts?.pending || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 8 }}>
              <span>Pending Cheque Books</span>
              <span className="admin-badge badge-warning">{stats?.chequeBooks?.pending || 0}</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Investment Overview</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Fixed Deposits</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.investments?.fds?.count || 0} accounts</div>
              <div style={{ fontSize: '1rem', color: '#16a34a', fontWeight: 600 }}>{formatCurrency(stats?.investments?.fds?.amount)}</div>
            </div>
            <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: 8, borderLeft: '4px solid #9333ea' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Recurring Deposits</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.investments?.rds?.count || 0} accounts</div>
              <div style={{ fontSize: '1rem', color: '#9333ea', fontWeight: 600 }}>{formatCurrency(stats?.investments?.rds?.amount)}</div>
            </div>
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: 8, borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Credit Cards</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.creditCards?.active || 0} active</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{stats?.creditCards?.blocked || 0} blocked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
