import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, search, typeFilter, statusFilter, dateFrom, dateTo]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page, limit: 15,
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      };
      const res = await admin.getTransactions(params);
      setTransactions(res.data.transactions || []);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      setTransactions([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async (transaction) => {
    if (!confirm("Are you sure you want to reverse this transaction? This action cannot be undone.")) return;
    try {
      await admin.reverseTransaction(transaction._id);
      loadTransactions();
    } catch (error) {
      setTransactions(transactions.map(t => t._id === transaction._id ? { ...t, status: "reversed" } : t));
    }
  };

  const handleCancel = async (transaction) => {
    if (!confirm("Cancel this pending transaction?")) return;
    try {
      await admin.cancelTransaction(transaction._id);
      loadTransactions();
    } catch (error) {
      setTransactions(transactions.map(t => t._id === transaction._id ? { ...t, status: "cancelled" } : t));
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "User", "Account", "Amount", "Status", "Description"];
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type,
      `${t.user?.firstName} ${t.user?.lastName}`,
      t.accountNumber,
      t.amount,
      t.status,
      t.description || "-"
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getTypeIcon = (type) => {
    const icons = { deposit: "⬇️", withdrawal: "⬆️", transfer: "↔️", payment: "💳", loan: "💰", fd: "📈", rd: "📊" };
    return icons[type] || "💳";
  };

  const getStatusBadge = (status) => {
    const badges = { completed: "badge-success", pending: "badge-warning", failed: "badge-danger", reversed: "badge-danger", cancelled: "badge-default" };
    return badges[status] || "badge-default";
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Transaction Management</h1>
        <p className="page-subtitle">View and manage all bank transactions</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info"><h3>{pagination.total}</h3><p>Total Transactions</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon green">💵</div>
          <div className="stat-info"><h3>{formatCurrency(totalAmount)}</h3><p>Total Amount</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-info"><h3>{transactions.filter(t => t.status === "pending").length}</h3><p>Pending</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-info"><h3>{transactions.filter(t => t.status === "failed").length}</h3><p>Failed</p></div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Transactions</h3>
          <button className="admin-btn admin-btn-primary" onClick={exportToCSV}>📥 Export CSV</button>
        </div>

        <div className="admin-search" style={{ flexWrap: "wrap" }}>
          <input type="text" placeholder="Search by account or user..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: "1 1 200px" }} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="transfer">Transfer</option>
            <option value="payment">Payment</option>
            <option value="loan">Loan</option>
            <option value="fd">Fixed Deposit</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner"></div></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Account</th>
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
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(txn.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <span style={{ marginRight: "0.5rem" }}>{getTypeIcon(txn.type)}</span>
                      <span style={{ textTransform: "capitalize" }}>{txn.type}</span>
                    </td>
                    <td>{txn.user?.firstName} {txn.user?.lastName}</td>
                    <td style={{ fontFamily: "monospace" }}>{txn.accountNumber}</td>
                    <td style={{ fontWeight: 600, color: txn.type === "withdrawal" ? "#dc2626" : "#16a34a" }}>
                      {txn.type === "withdrawal" ? "-" : "+"}{formatCurrency(txn.amount)}
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {txn.description || (txn.recipient ? `To: ${txn.recipient}` : "-")}
                    </td>
                    <td><span className={`admin-badge ${getStatusBadge(txn.status)}`}>{txn.status}</span></td>
                    <td>
                      <div className="admin-btn-group">
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setSelectedTransaction(txn)}>View</button>
                        {txn.status === "pending" && (
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleCancel(txn)}>Cancel</button>
                        )}
                        {txn.status === "completed" && (
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleReverse(txn)}>Reverse</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <span className="admin-pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                <div className="admin-pagination-buttons">
                  <button className="admin-btn admin-btn-secondary" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
                  <button className="admin-btn admin-btn-secondary" disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTransaction && (
        <div className="admin-modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Transaction Details</h3>
              <button className="admin-modal-close" onClick={() => setSelectedTransaction(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Transaction ID</span><span style={{ fontFamily: "monospace" }}>{selectedTransaction._id}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Type</span><span style={{ textTransform: "capitalize" }}>{selectedTransaction.type}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Amount</span><span style={{ fontWeight: 700, fontSize: "1.25rem" }}>{formatCurrency(selectedTransaction.amount)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>User</span><span>{selectedTransaction.user?.firstName} {selectedTransaction.user?.lastName}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Account</span><span style={{ fontFamily: "monospace" }}>{selectedTransaction.accountNumber}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Description</span><span>{selectedTransaction.description || "-"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Status</span><span className={`admin-badge ${getStatusBadge(selectedTransaction.status)}`}>{selectedTransaction.status}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Date</span><span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
