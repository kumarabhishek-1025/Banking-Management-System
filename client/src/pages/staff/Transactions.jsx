import React, { useState, useEffect } from "react";
import { staff as staffApi } from "../../services/api";

const StaffTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, dateFrom, dateTo]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      };
      const { data } = await staffApi.getTransactions(params);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (type) => {
    const icons = { deposit: "📥", withdrawal: "📤", transfer: "↔️", payment: "💳", loan: "💰", fd: "📈", rd: "📊" };
    return icons[type] || "💳";
  };

  const getStatusBadge = (status) => {
    const badges = { completed: "badge-success", pending: "badge-warning", failed: "badge-danger", reversed: "badge-danger", cancelled: "badge-default" };
    return badges[status] || "badge-default";
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Transactions</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>View and filter transactions</p>
      </div>

      <div className="staff-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="staff-stat-card">
          <div className="staff-stat-icon purple">📊</div>
          <div className="staff-stat-info"><h3>{transactions.length}</h3><p>Total Transactions</p></div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon green">📥</div>
          <div className="staff-stat-info"><h3>{formatCurrency(transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0))}</h3><p>Total Deposits</p></div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon red">📤</div>
          <div className="staff-stat-info"><h3>{formatCurrency(transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0))}</h3><p>Total Withdrawals</p></div>
        </div>
      </div>

      <div className="staff-card">
        <div className="staff-search">
          <input
            type="text"
            placeholder="Search by account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="transfer">Transfer</option>
            <option value="payment">Payment</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button className="staff-btn staff-btn-primary" onClick={loadTransactions}>Filter</button>
        </div>

        {loading ? (
          <div className="staff-loading"><div className="staff-spinner"></div></div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td>
                    <div>{new Date(txn.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(txn.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td>{txn.user?.firstName} {txn.user?.lastName}</td>
                  <td>
                    <span style={{ marginRight: '0.5rem' }}>{getTypeIcon(txn.type)}</span>
                    <span style={{ textTransform: 'capitalize' }}>{txn.type}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: txn.type === 'withdrawal' ? '#dc2626' : '#16a34a' }}>
                    {txn.type === 'withdrawal' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {txn.description || '-'}
                  </td>
                  <td><span className={`staff-badge ${getStatusBadge(txn.status)}`}>{txn.status}</span></td>
                  <td>
                    <button className="staff-btn staff-btn-secondary staff-btn-sm" onClick={() => setSelectedTransaction(txn)}>View</button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="staff-empty">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedTransaction && (
        <div className="staff-modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3 className="staff-modal-title">Transaction Details</h3>
              <button className="staff-modal-close" onClick={() => setSelectedTransaction(null)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Transaction ID</span><span style={{ fontFamily: 'monospace' }}>{selectedTransaction._id}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Type</span><span style={{ textTransform: 'capitalize' }}>{selectedTransaction.type}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Amount</span><span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(selectedTransaction.amount)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Customer</span><span>{selectedTransaction.user?.firstName} {selectedTransaction.user?.lastName}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Account</span><span style={{ fontFamily: 'monospace' }}>{selectedTransaction.accountNumber}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Description</span><span>{selectedTransaction.description || '-'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Status</span><span className={`staff-badge ${getStatusBadge(selectedTransaction.status)}`}>{selectedTransaction.status}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Date</span><span>{formatDate(selectedTransaction.createdAt)}</span></div>
              </div>
            </div>
            <div className="staff-modal-footer">
              <button className="staff-btn staff-btn-secondary" onClick={() => window.print()}>🖨️ Print</button>
              <button className="staff-btn staff-btn-primary" onClick={() => setSelectedTransaction(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTransactions;
