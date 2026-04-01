import React, { useState, useEffect } from "react";
import { admin as adminApi } from "../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await adminApi.getDashboard();
      setStats(data);
      
      const [loansRes, kycRes, accountsRes, txnsRes] = await Promise.all([
        adminApi.getLoans({ status: "pending" }),
        adminApi.getKYC({ status: "pending" }),
        adminApi.getAccounts({ status: "pending" }),
        adminApi.getTransactions({ status: "pending", limit: 10 })
      ]);
      
      setPendingLoans(loansRes.data.loans || []);
      setPendingKYC(kycRes.data.kycRecords || []);
      setAccounts(accountsRes.data.accounts || []);
      setTransactions(txnsRes.data.transactions || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId, status) => {
    try {
      const reason = status === "rejected" ? prompt("Enter rejection reason:") : null;
      await adminApi.reviewLoan(loanId, { status, rejectionReason: reason });
      alert(`Loan ${status}!`);
      loadDashboard();
    } catch (error) {
      alert("Action failed");
    }
  };

  const handleKycAction = async (kycId, status) => {
    try {
      const reason = status === "rejected" ? prompt("Enter rejection reason:") : null;
      await adminApi.reviewKYC(kycId, { status, rejectionReason: reason });
      alert(`KYC ${status}!`);
      loadDashboard();
    } catch (error) {
      alert("Action failed");
    }
  };

  const handleAccountAction = async (accountId, action) => {
    try {
      if (action === "approve") {
        await adminApi.approveAccount(accountId);
      } else if (action === "freeze") {
        await adminApi.freezeAccount(accountId);
      }
      alert(`Account ${action}ed!`);
      loadDashboard();
    } catch (error) {
      alert("Action failed");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.users?.total || 0, icon: "👥", color: "#3b82f6" },
    { label: "Total Accounts", value: stats?.accounts?.total || 0, icon: "🏦", color: "#10b981" },
    { label: "Total Balance", value: formatCurrency(stats?.accounts?.totalBalance), icon: "💰", color: "#f59e0b" },
    { label: "Pending Loans", value: stats?.loans?.pending || 0, icon: "📋", color: "#ef4444" },
    { label: "Pending KYC", value: stats?.kyc?.pending || 0, icon: "🆔", color: "#8b5cf6" },
    { label: "Loans Disbursed", value: formatCurrency(stats?.loans?.totalDisbursed), icon: "💵", color: "#06b6d4" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🛡️</h1>
          <p className="page-subtitle">Manage all banking operations</p>
        </div>
        <button className="btn btn-primary" onClick={loadDashboard}>🔄 Refresh</button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card hover-lift">
            <div className="stat-header">
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ fontSize: "1.5rem" }}>{stat.value}</div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${stat.color}20`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "1.5rem"
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Tabs */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.5rem" }}>
          {[
            { id: "dashboard", label: "📊 Overview", count: 0 },
            { id: "pending", label: "⏳ Pending", count: (stats?.loans?.pending || 0) + (stats?.kyc?.pending || 0) + (stats?.accounts?.pending || 0) },
            { id: "reports", label: "📈 Reports", count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.75rem 1.25rem", borderRadius: 10, border: "none",
                background: activeTab === tab.id ? "var(--gradient-primary)" : "var(--gray-100)",
                color: activeTab === tab.id ? "white" : "var(--text)", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem"
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? "white" : "var(--danger)",
                  color: activeTab === tab.id ? "var(--primary)" : "white",
                  padding: "0.1rem 0.5rem", borderRadius: 10, fontSize: "0.75rem"
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Overview */}
      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Transactions</h3>
            </div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {stats?.recentTransactions?.map((txn) => (
                <div key={txn._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderBottom: "1px solid var(--gray-100)" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{txn.description || txn.category}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{txn.user?.firstName} {txn.user?.lastName}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, color: txn.amount > 0 ? "var(--success)" : "var(--danger)" }}>
                      {txn.amount > 0 ? "+" : ""}{formatCurrency(txn.amount)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(txn.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Summary</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12 }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Fixed Deposits</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats?.investments?.fds?.count || 0}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--success)" }}>{formatCurrency(stats?.investments?.fds?.amount)}</div>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12 }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Credit Cards</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats?.creditCards?.active || 0}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Blocked: {stats?.creditCards?.blocked || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {activeTab === "pending" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🏦 Pending Accounts</h3>
              <span className="badge badge-warning">{accounts.length}</span>
            </div>
            <div style={{ maxHeight: 400, overflow: "auto" }}>
              {accounts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No pending accounts</div>
              ) : (
                accounts.map((account) => (
                  <div key={account._id} style={{ padding: "1rem", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ fontWeight: 600 }}>{account.bankName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>****{account.accountNumber?.slice(-4)}</div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "0.5rem" }} onClick={() => handleAccountAction(account._id, "approve")}>Approve</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: "0.5rem" }} onClick={() => handleAccountAction(account._id, "freeze")}>Freeze</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💵 Pending Loans</h3>
              <span className="badge badge-warning">{pendingLoans.length}</span>
            </div>
            <div style={{ maxHeight: 400, overflow: "auto" }}>
              {pendingLoans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No pending loans</div>
              ) : (
                pendingLoans.map((loan) => (
                  <div key={loan._id} style={{ padding: "1rem", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{loan.purpose} Loan - {formatCurrency(loan.amount)}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{loan.user?.firstName} {loan.user?.lastName}</div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "0.5rem" }} onClick={() => handleLoanAction(loan._id, "approved")}>Approve</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: "0.5rem", background: "#fee2e2", color: "#dc2626" }} onClick={() => handleLoanAction(loan._id, "rejected")}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🆔 Pending KYC</h3>
              <span className="badge badge-warning">{pendingKYC.length}</span>
            </div>
            <div style={{ maxHeight: 400, overflow: "auto" }}>
              {pendingKYC.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No pending KYC</div>
              ) : (
                pendingKYC.map((kyc) => (
                  <div key={kyc._id} style={{ padding: "1rem", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ fontWeight: 600 }}>{kyc.user?.firstName} {kyc.user?.lastName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{kyc.user?.email}</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}><span className="badge badge-secondary">Level {kyc.verificationLevel}/5</span></div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: "0.5rem" }} onClick={() => handleKycAction(kyc._id, "verified")}>Verify</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: "0.5rem", background: "#fee2e2", color: "#dc2626" }} onClick={() => handleKycAction(kyc._id, "rejected")}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Financial Summary</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>Total Deposits</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(stats?.accounts?.totalBalance)}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>Loans Disbursed</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{formatCurrency(stats?.loans?.totalDisbursed)}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>This Month Credits</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>{formatCurrency(stats?.transactions?.monthlyCredits)}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>This Month Debits</span>
                <span style={{ fontWeight: 700, color: "var(--danger)" }}>{formatCurrency(stats?.transactions?.monthlyDebits)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">👥 User Summary</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>Total Users</span>
                <span style={{ fontWeight: 700 }}>{stats?.users?.total}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>New Today</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>+{stats?.users?.newToday}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>Verified KYC</span>
                <span style={{ fontWeight: 700, color: "var(--success)" }}>{stats?.kyc?.verified}</span>
              </div>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <span>Active Accounts</span>
                <span style={{ fontWeight: 700 }}>{stats?.accounts?.active}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
