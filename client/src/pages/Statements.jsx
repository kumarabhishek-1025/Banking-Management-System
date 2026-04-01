import React, { useState, useEffect } from "react";
import { statements as statementsApi, accounts as accountsApi } from "../services/api";

const Statements = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalCredits: 0, totalDebits: 0, transactionCount: 0 });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadStatement();
    }
  }, [selectedAccount, dateRange]);

  const loadAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts || []);
      if (data.accounts?.length > 0) {
        setSelectedAccount(data.accounts[0]._id);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const loadStatement = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const params = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        limit: 100
      };
      
      const { data } = activeTab === "account" 
        ? await statementsApi.getAccountStatement(selectedAccount, params)
        : await statementsApi.getConsolidated(params);
      
      setTransactions(data.transactions || []);
      setSummary(data.summary || { totalCredits: 0, totalDebits: 0, transactionCount: 0 });
    } catch (error) {
      console.error("Failed to load statement:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatDateTime = (date) => new Date(date).toLocaleString();

  const getTypeIcon = (type) => {
    const icons = {
      deposit: "↓",
      withdrawal: "↑",
      transfer: "⇄",
      payment: "💳",
      bill: "📄"
    };
    return icons[type] || "•";
  };

  const getTypeColor = (amount) => {
    return amount > 0 ? "var(--success)" : "var(--danger)";
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount", "Status"];
    const rows = transactions.map(t => [
      formatDateTime(t.createdAt),
      t.description || "",
      t.category || "",
      t.type || "",
      t.amount || 0,
      t.status || ""
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${selectedAccount}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Account Statements</h1>
          <p className="page-subtitle">View and download your transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={exportToCSV} disabled={transactions.length === 0}>
          Export CSV
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>Select Account</label>
            <select
              className="form-input"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.bankName} - **** {acc.accountNumber?.slice(-4)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>From Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>To Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Credits</div>
              <div className="stat-value" style={{ color: "var(--success)" }}>${summary.totalCredits?.toLocaleString()}</div>
            </div>
            <div className="stat-icon success">↓</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Debits</div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>${summary.totalDebits?.toLocaleString()}</div>
            </div>
            <div className="stat-icon warning">↑</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{summary.transactionCount}</div>
            </div>
            <div className="stat-icon primary">📋</div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3 className="empty-title">No Transactions</h3>
            <p className="empty-text">No transactions found for the selected period.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Reference</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {formatDateTime(txn.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{getTypeIcon(txn.type)}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{txn.description || txn.category}</div>
                        {txn.account?.bankName && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{txn.account.bankName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{txn.category || "-"}</span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{txn.reference || txn.transactionId || "-"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: getTypeColor(txn.amount) }}>
                    {txn.amount > 0 ? "+" : ""}{txn.amount?.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${txn.status === "completed" ? "badge-success" : "badge-warning"}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Statements;
