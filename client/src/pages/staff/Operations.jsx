import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { staff as staffApi } from "../../services/api";

const StaffOperations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('action') || 'deposit');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState(null);
  
  const [formData, setFormData] = useState({
    accountNumber: "",
    amount: "",
    description: "",
    recipientAccount: "",
    accountType: "savings",
    initialBalance: 0
  });

  useEffect(() => {
    const action = searchParams.get('action');
    if (action) setActiveTab(action);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ action: tab });
    setReceipt(null);
    setSelectedCustomer(null);
    setFormData({ accountNumber: "", amount: "", description: "", recipientAccount: "", accountType: "savings", initialBalance: 0 });
  };

  const searchCustomer = async () => {
    if (!formData.accountNumber) return alert("Please enter account number");
    try {
      setLoading(true);
      const { data } = await staffApi.getCustomerByAccount(formData.accountNumber);
      setSelectedCustomer(data);
    } catch (error) {
      alert("Customer not found");
      setSelectedCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedCustomer || !formData.amount) return alert("Please select customer and enter amount");
    try {
      setLoading(true);
      const { data } = await staffApi.deposit({ accountId: selectedCustomer._id, amount: parseFloat(formData.amount), description: formData.description || "Cash Deposit" });
      setReceipt({ type: "Deposit", ...data, customer: selectedCustomer, amount: parseFloat(formData.amount), date: new Date() });
      setSelectedCustomer(null);
      setFormData({ ...formData, amount: "", description: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCustomer || !formData.amount) return alert("Please select customer and enter amount");
    try {
      setLoading(true);
      const { data } = await staffApi.withdraw({ accountId: selectedCustomer._id, amount: parseFloat(formData.amount), description: formData.description || "Cash Withdrawal" });
      setReceipt({ type: "Withdrawal", ...data, customer: selectedCustomer, amount: parseFloat(formData.amount), date: new Date() });
      setSelectedCustomer(null);
      setFormData({ ...formData, amount: "", description: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedCustomer || !formData.amount || !formData.recipientAccount) return alert("Please fill all fields");
    try {
      setLoading(true);
      const { data } = await staffApi.transfer({ fromAccountId: selectedCustomer._id, toAccountNumber: formData.recipientAccount, amount: parseFloat(formData.amount), description: formData.description || "Internal Transfer" });
      setReceipt({ type: "Transfer", ...data, customer: selectedCustomer, amount: parseFloat(formData.amount), date: new Date() });
      setSelectedCustomer(null);
      setFormData({ ...formData, amount: "", description: "", recipientAccount: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAccount = async () => {
    if (!formData.customerId || !formData.accountType || !formData.initialBalance) return alert("Please fill all fields");
    try {
      setLoading(true);
      const { data } = await staffApi.createAccount({ userId: formData.customerId, accountType: formData.accountType, initialBalance: parseFloat(formData.initialBalance) });
      setReceipt({ type: "Account Opened", ...data, date: new Date() });
      setFormData({ ...formData, customerId: "", accountType: "savings", initialBalance: 0 });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to open account");
    } finally {
      setLoading(false);
    }
  };

  const searchCustomerForAccount = async () => {
    if (!search) return;
    try {
      const { data } = await staffApi.searchCustomers({ name: search });
      setCustomers(data.customers || []);
    } catch (error) {
      setCustomers([]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Operations</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Process deposits, withdrawals, and transfers</p>
      </div>

      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => handleTabChange('deposit')}>📥 Deposit</button>
        <button className={`staff-tab ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => handleTabChange('withdraw')}>📤 Withdrawal</button>
        <button className={`staff-tab ${activeTab === 'transfer' ? 'active' : ''}`} onClick={() => handleTabChange('transfer')}>↔️ Transfer</button>
        <button className={`staff-tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => handleTabChange('account')}>🏦 Open Account</button>
      </div>

      {receipt && (
        <div className="staff-card" style={{ marginBottom: '1.5rem', border: '2px solid #22c55e' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>Transaction Successful!</h3>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, maxWidth: 400, margin: '0 auto', border: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Type:</span>
                <span style={{ fontWeight: 600 }}>{receipt.type}</span>
              </div>
              {receipt.customer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <span style={{ fontWeight: 600 }}>{receipt.customer.firstName} {receipt.customer.lastName}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Amount:</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#16a34a' }}>{formatCurrency(receipt.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Date:</span>
                <span>{receipt.date?.toLocaleString()}</span>
              </div>
              {receipt.transactionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Transaction ID:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{receipt.transactionId}</span>
                </div>
              )}
            </div>
            <button className="staff-btn staff-btn-primary" style={{ marginTop: '1rem' }} onClick={printReceipt}>🖨️ Print Receipt</button>
            <button className="staff-btn staff-btn-secondary" style={{ marginTop: '1rem', marginLeft: '0.5rem' }} onClick={() => setReceipt(null)}>New Transaction</button>
          </div>
        </div>
      )}

      {(activeTab === 'deposit' || activeTab === 'withdraw' || activeTab === 'transfer') && !receipt && (
        <div className="staff-card">
          <div className="staff-search">
            <input
              type="text"
              placeholder="Enter Account Number"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <button className="staff-btn staff-btn-primary" onClick={searchCustomer} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {selectedCustomer && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #22c55e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedCustomer.accountNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Available Balance</div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#16a34a' }}>{formatCurrency(selectedCustomer.balance)}</div>
                </div>
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="staff-form-grid">
              <div className="staff-form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              {activeTab === 'transfer' && (
                <div className="staff-form-group">
                  <label>Recipient Account Number *</label>
                  <input
                    type="text"
                    value={formData.recipientAccount}
                    onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                    placeholder="Enter recipient account"
                  />
                </div>
              )}
              <div className="staff-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button
                  className="staff-btn staff-btn-primary"
                  style={{ width: '100%', padding: '1rem' }}
                  onClick={activeTab === 'deposit' ? handleDeposit : activeTab === 'withdraw' ? handleWithdraw : handleTransfer}
                  disabled={loading || !formData.amount}
                >
                  {loading ? "Processing..." : activeTab === 'deposit' ? `📥 Deposit ${formatCurrency(formData.amount)}` : activeTab === 'withdraw' ? `📤 Withdraw ${formatCurrency(formData.amount)}` : `↔️ Transfer ${formatCurrency(formData.amount)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'account' && !receipt && (
        <div className="staff-card">
          <h3 style={{ marginBottom: '1rem' }}>Open New Account</h3>
          <div className="staff-search">
            <input
              type="text"
              placeholder="Search customer by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="staff-btn staff-btn-primary" onClick={searchCustomerForAccount}>Search</button>
          </div>

          {customers.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Select Customer:</div>
              {customers.map((c) => (
                <div
                  key={c._id}
                  style={{ padding: '0.75rem', background: formData.customerId === c._id ? '#fef3c7' : '#f8fafc', borderRadius: 8, marginBottom: '0.5rem', cursor: 'pointer', border: formData.customerId === c._id ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}
                  onClick={() => setFormData({ ...formData, customerId: c._id })}
                >
                  {c.firstName} {c.lastName} - {c.email}
                </div>
              ))}
            </div>
          )}

          {formData.customerId && (
            <div className="staff-form-grid">
              <div className="staff-form-group">
                <label>Account Type *</label>
                <select value={formData.accountType} onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}>
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                </select>
              </div>
              <div className="staff-form-group">
                <label>Initial Balance (₹) *</label>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  min="0"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button
                  className="staff-btn staff-btn-primary"
                  style={{ width: '100%', padding: '1rem' }}
                  onClick={handleOpenAccount}
                  disabled={loading || !formData.initialBalance}
                >
                  {loading ? "Creating..." : "🏦 Create Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffOperations;
