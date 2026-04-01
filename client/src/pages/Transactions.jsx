import React, { useState, useEffect } from "react";
import { transactions as transactionsApi } from "../services/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data } = await transactionsApi.getAll({ limit: 100 });
      setTransactions(data.transactions || []);
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0 });
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit": return "📥";
      case "withdrawal": return "📤";
      case "transfer": return "🔄";
      case "payment": return "💳";
      case "bill": return "📄";
      default: return "💰";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">View your transaction history</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Income</div>
              <div className="stat-value" style={{ color: "var(--success)" }}>
                ${summary.totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="stat-icon success">📈</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>
                ${summary.totalExpense.toLocaleString()}
              </div>
            </div>
            <div className="stat-icon warning">📉</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Transactions</h3>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className={`transaction-icon ${tx.type}`}>
                          {getTransactionIcon(tx.type)}
                        </span>
                        <div className="transaction-info">
                          <span className="transaction-name">{tx.description || tx.category}</span>
                          <span className="transaction-date">{tx.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td>
                      <span className={`transaction-status ${tx.status}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <span className={`transaction-amount ${tx.amount >= 0 ? "positive" : "negative"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No Transactions Yet</h3>
            <p className="empty-text">Your transactions will appear here once you start using your account.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
