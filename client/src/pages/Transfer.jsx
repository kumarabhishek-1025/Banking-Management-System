import React, { useState, useEffect } from "react";
import { accounts as accountsApi, transfers } from "../services/api";

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountNumber: "",
    amount: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts || []);
      if (data.accounts?.length > 0) {
        setFormData(prev => ({ ...prev, fromAccountId: data.accounts[0]._id }));
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const { data } = await transfers.send({
        fromAccountId: formData.fromAccountId,
        toAccountNumber: formData.toAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setMessage(`✅ Transfer successful! New balance: $${data.senderBalance.toLocaleString()}`);
      setSuccess(true);
      setFormData({
        fromAccountId: accounts[0]?._id || "",
        toAccountNumber: "",
        amount: "",
        description: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transfer Money</h1>
        <p className="page-subtitle">Send money to any bank account securely</p>
      </div>

      <div className="transfer-container">
        <div className="transfer-form">
          <div className="transfer-amount-display">
            <div className="transfer-amount-label">Amount to Transfer</div>
            <div className="transfer-amount-value">
              ${formData.amount || "0"}
            </div>
          </div>

          {message && (
            <div className={success ? "success-message" : "auth-error"}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">From Account</label>
              <select
                className="form-input"
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                required
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} - ****{account.accountNumber?.slice(-4)} (${account.availableBalance?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Account Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter account number"
                value={formData.toAccountNumber}
                onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="What's this for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading || accounts.length === 0}>
              {loading ? "Processing..." : "Send Money 📤"}
            </button>
          </form>

          {accounts.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-muted)" }}>
              You need at least one account to transfer money.
            </p>
          )}
        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <div className="card-header">
            <h3 className="card-title">Quick Amount</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action" onClick={() => setFormData({ ...formData, amount: "100" })}>
              <div className="quick-action-icon">💵</div>
              <span className="quick-action-label">$100</span>
            </button>
            <button className="quick-action" onClick={() => setFormData({ ...formData, amount: "250" })}>
              <div className="quick-action-icon">💵</div>
              <span className="quick-action-label">$250</span>
            </button>
            <button className="quick-action" onClick={() => setFormData({ ...formData, amount: "500" })}>
              <div className="quick-action-icon">💵</div>
              <span className="quick-action-label">$500</span>
            </button>
            <button className="quick-action" onClick={() => setFormData({ ...formData, amount: "1000" })}>
              <div className="quick-action-icon">💵</div>
              <span className="quick-action-label">$1000</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
