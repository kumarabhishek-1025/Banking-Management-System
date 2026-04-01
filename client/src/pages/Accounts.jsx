import React, { useState, useEffect } from "react";
import { accounts as accountsApi } from "../services/api";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "Horizon Bank",
    branchName: "Main Branch",
    accountType: "checking",
    initialDeposit: 1000
  });
  const [depositData, setDepositData] = useState({ amount: "", description: "" });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await accountsApi.create(formData);
      setMessage("✅ Account created successfully!");
      setShowModal(false);
      setFormData({ bankName: "Horizon Bank", branchName: "Main Branch", accountType: "checking", initialDeposit: 1000 });
      loadAccounts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await accountsApi.deposit(selectedAccount, { amount: parseFloat(depositData.amount), description: depositData.description });
      setMessage("✅ Deposit successful!");
      setShowDepositModal(false);
      setDepositData({ amount: "", description: "" });
      loadAccounts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const formatAccountNumber = (num) => {
    return "****" + num?.slice(-4);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Accounts</h1>
        <p className="page-subtitle">Manage your bank accounts</p>
      </div>

      {message && !showModal && !showDepositModal && (
        <div className="success-message">{message}</div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Accounts</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ New Account
          </button>
        </div>

        {accounts.length > 0 ? (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account._id} className="account-card">
                <span className={`account-type ${account.accountType}`}>
                  {account.accountType}
                </span>
                <div className="account-bank">{account.bankName}</div>
                <div className="account-number">{formatAccountNumber(account.accountNumber)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <div className="account-balance-label">Available</div>
                    <div className="account-balance-value">${account.availableBalance?.toLocaleString() || "0"}</div>
                  </div>
                  <div>
                    <div className="account-balance-label">Current</div>
                    <div className="account-balance-value" style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>
                      ${account.balance?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
                <div className="account-actions">
                  <button className="btn btn-primary" onClick={() => { setSelectedAccount(account._id); setShowDepositModal(true); }}>
                    Deposit
                  </button>
                  <button className="btn btn-secondary">
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <h3 className="empty-title">No Accounts Yet</h3>
            <p className="empty-text">Create your first bank account to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create Account
            </button>
          </div>
        )}
      </div>

      {/* Account Benefits */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛡️</div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Secure Banking</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Your money is protected</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📱</div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>24/7 Access</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Bank anywhere, anytime</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>High Interest</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Earn up to 4.5% APY</div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {message && <div className="auth-error">{message}</div>}

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-input"
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                >
                  <option value="checking">Checking Account</option>
                  <option value="savings">Savings Account</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Deposit ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.initialDeposit}
                  onChange={(e) => setFormData({ ...formData, initialDeposit: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Deposit Money</h3>
              <button className="modal-close" onClick={() => setShowDepositModal(false)}>×</button>
            </div>

            {message && <div className="auth-error">{message}</div>}

            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What's this deposit for?"
                  value={depositData.description}
                  onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDepositModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Depositing..." : "Deposit 💵"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
