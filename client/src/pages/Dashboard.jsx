import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { accounts as accountsApi } from "../services/api";

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ totalBalance: 0, accountCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts || []);
      setSummary(data.summary || { totalBalance: 0, accountCount: 0 });
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAccountNumber = (num) => {
    return "****" + num?.slice(-4);
  };

  const services = [
    { icon: "💳", name: "Credit Cards", desc: "Apply now", link: "/dashboard/credit-cards", color: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" },
    { icon: "🏠", name: "Loans", desc: "Personal & Home", link: "/dashboard/loans", color: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    { icon: "📊", name: "Fixed Deposits", desc: "Earn more", link: "/dashboard/fixed-deposits", color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
    { icon: "📈", name: "Recurring Deposits", desc: "Save monthly", link: "/dashboard/recurring-deposits", color: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
    { icon: "📝", name: "Cheque Books", desc: "Request now", link: "/dashboard/cheque-books", color: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
    { icon: "📄", name: "Statements", desc: "Download", link: "/dashboard/statements", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back! <span className="gradient-text">👋</span></h1>
        <p className="page-subtitle">Here's your financial overview for today</p>
      </div>

      {/* Hero Card Display */}
      {accounts.length > 0 && (
        <div className="hero-card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div>
              <div className="hero-label">Available Balance</div>
              <div className="hero-value">${summary.totalBalance.toLocaleString()}</div>
            </div>
            <div style={{ 
              padding: "0.5rem 1rem", 
              background: "rgba(255,255,255,0.2)", 
              borderRadius: 20,
              fontSize: "0.85rem",
              backdropFilter: "blur(10px)"
            }}>
              {accounts[0]?.accountType?.toUpperCase()} Account
            </div>
          </div>
          <div className="hero-account" style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-account-number">{accounts[0]?.accountNumber || "•••• •••• •••• ••••"}</div>
            <div className="hero-bank">{accounts[0]?.bankName || "Horizon Bank"}</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid stagger">
        <div className="stat-card hover-lift">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Balance</div>
              <div className="stat-value">${summary.totalBalance.toLocaleString()}</div>
            </div>
            <div className="stat-icon primary">💰</div>
          </div>
          <span className="stat-badge primary">Across {summary.accountCount} accounts</span>
        </div>

        <div className="stat-card hover-lift">
          <div className="stat-header">
            <div>
              <div className="stat-label">Income This Month</div>
              <div className="stat-value" style={{ color: "var(--success)" }}>$0.00</div>
            </div>
            <div className="stat-icon success">📈</div>
          </div>
          <span className="stat-badge success">+0% from last month</span>
        </div>

        <div className="stat-card hover-lift">
          <div className="stat-header">
            <div>
              <div className="stat-label">Expenses This Month</div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>$0.00</div>
            </div>
            <div className="stat-icon warning">📉</div>
          </div>
          <span className="stat-badge primary">Bill payments</span>
        </div>

        <div className="stat-card hover-lift">
          <div className="stat-header">
            <div>
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: "var(--warning)" }}>$0.00</div>
            </div>
            <div className="stat-icon pink">⏳</div>
          </div>
          <span className="stat-badge primary">Processing</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Accounts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Accounts</h3>
            <Link to="/dashboard/accounts" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              View All →
            </Link>
          </div>
          
          {accounts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {accounts.slice(0, 3).map((account) => (
                <div key={account._id} className="account-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span className={`account-type ${account.accountType}`}>
                      {account.accountType}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: account.status === "active" ? "var(--success)" : "var(--warning)" }}>
                      ● {account.status}
                    </span>
                  </div>
                  <div className="account-bank">{account.bankName}</div>
                  <div className="account-number">{formatAccountNumber(account.accountNumber)}</div>
                  <div className="account-balance">
                    <div className="account-balance-label">Available Balance</div>
                    <div className="account-balance-value">
                      ${account.availableBalance?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏦</div>
              <h3 className="empty-title">No Accounts Yet</h3>
              <p className="empty-text">Create your first bank account to get started.</p>
              <Link to="/dashboard/accounts" className="btn btn-primary">Create Account</Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link to="/dashboard/accounts" className="quick-action" style={{ flexDirection: "row", padding: "1rem", justifyContent: "flex-start", gap: "1rem", textDecoration: "none", color: "inherit" }}>
              <div className="quick-action-icon" style={{ width: 44, height: 44, fontSize: "1.25rem" }}>💳</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Accounts</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>View & manage accounts</span>
              </div>
            </Link>
            <Link to="/dashboard/transfer" className="quick-action" style={{ flexDirection: "row", padding: "1rem", justifyContent: "flex-start", gap: "1rem", textDecoration: "none", color: "inherit" }}>
              <div className="quick-action-icon" style={{ width: 44, height: 44, fontSize: "1.25rem" }}>📤</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Transfer</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Send money</span>
              </div>
            </Link>
            <Link to="/dashboard/payments" className="quick-action" style={{ flexDirection: "row", padding: "1rem", justifyContent: "flex-start", gap: "1rem", textDecoration: "none", color: "inherit" }}>
              <div className="quick-action-icon" style={{ width: 44, height: 44, fontSize: "1.25rem" }}>💵</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>Payments</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Bill payments & more</span>
              </div>
            </Link>
            <Link to="/dashboard/transactions" className="quick-action" style={{ flexDirection: "row", padding: "1rem", justifyContent: "flex-start", gap: "1rem", textDecoration: "none", color: "inherit" }}>
              <div className="quick-action-icon" style={{ width: 44, height: 44, fontSize: "1.25rem" }}>📋</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>View History</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Transaction history</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Banking Services</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem" }}>
          {services.map((service, index) => (
            <Link key={index} to={service.link} className="service-card" style={{ textDecoration: "none" }}>
              <div className="service-icon" style={{ background: service.color.replace("135deg", "135deg").split(")")[0] + ")", width: 56, height: 56, margin: "0 auto 0.75rem" }}>
                {service.icon}
              </div>
              <div className="service-name">{service.name}</div>
              <div className="service-desc">{service.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
