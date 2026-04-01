import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accounts as accountsApi, payments } from "../services/api";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountId: "",
    amount: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    loadAccounts();
    checkDemoMode();
  }, []);

  const loadAccounts = async () => {
    try {
      const { data } = await accountsApi.getAll();
      setAccounts(data.accounts || []);
      if (data.accounts?.length > 0) {
        setFormData(prev => ({ ...prev, accountId: data.accounts[0]._id }));
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const checkDemoMode = async () => {
    try {
      const { data } = await payments.getConfig();
      setDemoMode(data.demoMode);
    } catch (error) {
      setDemoMode(true);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      setMessage("Please select an account and enter amount");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // For Mock Payment, we'll just create a demo order and immediately verify it
      const { data: orderData } = await payments.createOrder({
        accountId: formData.accountId,
        amount: parseFloat(formData.amount)
      });

      // Directly verify the payment using fake data
      const fakePaymentId = "pay_mock_" + Date.now();
      const fakeSignature = "mock_sig_" + Date.now();

      await payments.verifyPayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: fakeSignature,
        accountId: formData.accountId,
        amount: formData.amount
      });

      setMessage(`✅ Payment Successful! ₹${formData.amount} added to your account.`);
      setTimeout(() => navigate("/accounts"), 2500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Money</h1>
        <p className="page-subtitle">Add funds to your account instantly</p>
      </div>

      {message && (
        <div className={message.includes("✅") ? "success-message" : "auth-error"}>
          {message}
        </div>
      )}

      <div className="card" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "2rem" }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Mock Payment Active</div>
            <div style={{ opacity: 0.9, fontSize: "0.9rem" }}>
              Money will be added instantly using our simulated payment gateway!
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Payment Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💳 Add Money</h3>
          </div>

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">Select Account</label>
              <select
                className="form-input"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} - ****{account.accountNumber?.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter amount in INR"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="1"
                max="100000"
                required
              />
            </div>

            {/* Quick amounts */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[100, 500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
                  onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading 
                ? "Processing..." 
                : demoMode 
                  ? "🎮 Add Money (Demo)" 
                  : "Pay with Razorpay 💳"}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {demoMode ? "🎮 How Demo Works" : "💳 Payment Methods"}
              </h3>
            </div>
            
            {demoMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Enter Amount</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Any amount from ₹1 to ₹1,00,000</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Click Add Money</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Money added instantly</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Done!</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Start using your money</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "var(--gray-50)", borderRadius: 12 }}>
                  <div style={{ fontSize: "1.5rem" }}>📱</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>UPI</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Google Pay, PhonePe, Paytm</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "var(--gray-50)", borderRadius: 12 }}>
                  <div style={{ fontSize: "1.5rem" }}>💳</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Debit/Credit Card</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>All major cards</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: "1rem" }}>
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {demoMode ? "Instant Demo Transfer" : "Instant Transfer"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {demoMode 
                  ? "No verification needed - test freely!" 
                  : "Money added to account within seconds"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
