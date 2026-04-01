import React, { useState, useEffect } from "react";
import { admin, accounts } from "../../services/api";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: "", accountType: "savings", initialBalance: 0
  });
  const [limitsData, setLimitsData] = useState({
    withdrawalLimit: 0, transactionLimit: 0
  });

  useEffect(() => {
    loadAccounts();
    loadUsers();
  }, [pagination.page, search, typeFilter, statusFilter]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page, limit: 10,
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      };
      const res = await admin.getAccounts(params);
      setAccounts(res.data.accounts || []);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      setAccounts([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await admin.getUsers({ limit: 100 });
      setUsers(res.data.users || []);
    } catch (error) {
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admin.createAccount(formData);
      setShowModal(false);
      loadAccounts();
    } catch (error) {
      // Mock create
      const newAccount = {
        _id: Date.now().toString(),
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        user: users.find(u => u._id === formData.userId) || { firstName: "New", lastName: "User" },
        type: formData.accountType,
        balance: formData.initialBalance,
        status: "active",
        withdrawalLimit: 25000,
        transactionLimit: 100000
      };
      setAccounts([...accounts, newAccount]);
      setShowModal(false);
    }
  };

  const handleApprove = async (account) => {
    try {
      await admin.approveAccount(account._id);
      loadAccounts();
    } catch (error) {
      setAccounts(accounts.map(a => a._id === account._id ? { ...a, status: "active" } : a));
    }
  };

  const handleFreeze = async (account) => {
    try {
      await admin.freezeAccount(account._id);
      loadAccounts();
    } catch (error) {
      setAccounts(accounts.map(a => a._id === account._id ? { 
        ...a, status: a.status === "frozen" ? "active" : "frozen" 
      } : a));
    }
  };

  const handleClose = async (account) => {
    if (!confirm("Are you sure you want to close this account?")) return;
    try {
      await admin.closeAccount(account._id);
      loadAccounts();
    } catch (error) {
      setAccounts(accounts.filter(a => a._id !== account._id));
    }
  };

  const openLimitsModal = (account) => {
    setSelectedAccount(account);
    setLimitsData({
      withdrawalLimit: account.withdrawalLimit || 0,
      transactionLimit: account.transactionLimit || 0
    });
    setShowLimitsModal(true);
  };

  const handleUpdateLimits = async (e) => {
    e.preventDefault();
    try {
      await admin.updateAccountLimits(selectedAccount._id, limitsData);
      setShowLimitsModal(false);
      loadAccounts();
    } catch (error) {
      setAccounts(accounts.map(a => a._id === selectedAccount._id ? { 
        ...a, ...limitsData 
      } : a));
      setShowLimitsModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: { text: "Active", color: "badge-success" },
      pending: { text: "Pending", color: "badge-warning" },
      rejected: { text: "Rejected", color: "badge-danger" },
      frozen: { text: "Frozen", color: "badge-danger" },
      closed: { text: "Closed", color: "badge-default" },
      closed_by_customer: { text: "Closed by Customer", color: "badge-warning" },
      closed_by_admin: { text: "Closed by Admin", color: "badge-danger" }
    };
    return labels[status] || { text: status, color: "badge-default" };
  };

  const getTypeBadge = (type) => {
    const badges = { savings: "badge-info", current: "badge-success", fixed: "badge-warning" };
    return badges[type] || "badge-default";
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Account Management</h1>
        <p className="page-subtitle">Manage all bank accounts</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Accounts ({pagination.total})</h3>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
            ➕ Create Account
          </button>
        </div>

        <div className="admin-search">
          <input type="text" placeholder="Search by account number or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
            <option value="fixed">Fixed Deposit</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="frozen">Frozen</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner"></div></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account No.</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Withdrawal Limit</th>
                  <th>Transaction Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const statusInfo = getStatusLabel(account.status);
                  return (
                  <tr key={account._id} style={account.status?.includes("closed") ? { background: "#fff5f5" } : {}}>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{account.accountNumber}</td>
                    <td>
                      {account.user ? (
                        <span>{account.user?.firstName} {account.user?.lastName}</span>
                      ) : (
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ Deleted</span>
                      )}
                    </td>
                    <td><span className={`admin-badge ${getTypeBadge(account.type)}`}>{account.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(account.balance)}</td>
                    <td>{formatCurrency(account.withdrawalLimit)}</td>
                    <td>{formatCurrency(account.transactionLimit)}</td>
                    <td>
                      <span className={`admin-badge ${statusInfo.color}`} title={account.closureReason || ""}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td>
                      <div className="admin-btn-group">
                        {account.status === "pending" && (
                          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleApprove(account)}>
                            Approve
                          </button>
                        )}
                        {account.status === "active" && (
                          <>
                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openLimitsModal(account)}>
                              Limits
                            </button>
                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleFreeze(account)}>
                              Freeze
                            </button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleClose(account)}>
                              Close
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Create New Account</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Select Customer *</label>
                  <select value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} required>
                    <option value="">Select Customer</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Account Type *</label>
                  <select value={formData.accountType} onChange={(e) => setFormData({...formData, accountType: e.target.value})}>
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                    <option value="fixed_deposit">Fixed Deposit Account</option>
                    <option value="recurring_deposit">Recurring Deposit Account</option>
                  </select>
                </div>
                {formData.accountType === "fixed_deposit" && (
                  <>
                    <div className="admin-form-group">
                      <label>FD Amount (₹)</label>
                      <input type="number" value={formData.fdAmount || ""} onChange={(e) => setFormData({...formData, fdAmount: e.target.value})} min="1000" />
                    </div>
                    <div className="admin-form-group">
                      <label>FD Tenure (Months)</label>
                      <select value={formData.fdTenure || ""} onChange={(e) => setFormData({...formData, fdTenure: e.target.value})}>
                        <option value="">Select Tenure</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                        <option value="48">48 Months</option>
                        <option value="60">60 Months</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Interest Rate (%)</label>
                      <input type="number" value={formData.fdInterestRate || "6.5"} onChange={(e) => setFormData({...formData, fdInterestRate: e.target.value})} step="0.1" />
                    </div>
                  </>
                )}
                {formData.accountType !== "fixed_deposit" && (
                <div className="admin-form-group">
                  <label>Initial Balance</label>
                  <input type="number" value={formData.initialBalance} onChange={(e) => setFormData({...formData, initialBalance: e.target.value})} min="0" />
                </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLimitsModal && selectedAccount && (
        <div className="admin-modal-overlay" onClick={() => setShowLimitsModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Update Account Limits</h3>
              <button className="admin-modal-close" onClick={() => setShowLimitsModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateLimits}>
              <div className="admin-modal-body">
                <p style={{ marginBottom: "1rem", color: "#64748b" }}>Account: {selectedAccount.accountNumber}</p>
                <div className="admin-form-group">
                  <label>Withdrawal Limit (₹)</label>
                  <input type="number" value={limitsData.withdrawalLimit} onChange={(e) => setLimitsData({...limitsData, withdrawalLimit: e.target.value})} min="0" />
                </div>
                <div className="admin-form-group">
                  <label>Transaction Limit (₹)</label>
                  <input type="number" value={limitsData.transactionLimit} onChange={(e) => setLimitsData({...limitsData, transactionLimit: e.target.value})} min="0" />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowLimitsModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Update Limits</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
