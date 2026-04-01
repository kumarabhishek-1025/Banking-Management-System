import React, { useState } from "react";
import { Link } from "react-router-dom";
import { accounts as accountsApi, transactions } from "../services/api";

const Payments = () => {
  const [accounts, setAccounts] = React.useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [formData, setFormData] = useState({
    accountId: "",
    billType: "",
    billerName: "",
    amount: "",
    accountNumber: "",
    mobileNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    loadAccounts();
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

  const categories = [
    { id: "all", name: "All Services", icon: "🌟" },
    { id: "telecom", name: "Mobile & Telecom", icon: "📱" },
    { id: "electricity", name: "Electricity", icon: "⚡" },
    { id: "dth", name: "DTH & Cable", icon: "📺" },
    { id: "gas", name: "Gas & Propane", icon: "🔥" },
    { id: "water", name: "Water", icon: "💧" },
    { id: "insurance", name: "Insurance", icon: "🛡️" },
    { id: "broadband", name: "Broadband", icon: "🌐" },
    { id: "creditcard", name: "Credit Card", icon: "💳" },
  ];

  const billers = {
    telecom: [
      { id: "airtel", name: "Airtel Prepaid", logo: "A", color: "#e61e2e", type: "prepaid" },
      { id: "airtel_postpaid", name: "Airtel Postpaid", logo: "A", color: "#e61e2e", type: "postpaid" },
      { id: "jio", name: "Jio Prepaid", logo: "J", color: "#0f4cba", type: "prepaid" },
      { id: "jio_postpaid", name: "Jio Postpaid", logo: "J", color: "#0f4cba", type: "postpaid" },
      { id: "vi_prepaid", name: "Vi Prepaid (Vodafone)", logo: "V", color: "#e60000", type: "prepaid" },
      { id: "vi_postpaid", name: "Vi Postpaid", logo: "V", color: "#e60000", type: "postpaid" },
      { id: "bsnl_prepaid", name: "BSNL Prepaid", logo: "B", color: "#003974", type: "prepaid" },
      { id: "bsnl_postpaid", name: "BSNL Postpaid", logo: "B", color: "#003974", type: "postpaid" },
      { id: "aircel", name: "Aircel", logo: "A", color: "#f7941d", type: "prepaid" },
      { id: "mtnl_delhi", name: "MTNL Delhi", logo: "M", color: "#0066b1", type: "prepaid" },
      { id: "mtnl_mumbai", name: "MTNL Mumbai", logo: "M", color: "#0066b1", type: "prepaid" },
    ],
    electricity: [
      { id: "jbvnl", name: "Jharkhand Bijli (JBVNL)", logo: "⚡", color: "#ff6f00", state: "Jharkhand" },
      { id: "bseb", name: "Bihar State Electricity (BSEB)", logo: "⚡", color: "#1e88e5", state: "Bihar" },
      { id: "uppcb", name: "UP Power Corp (UPPCL)", logo: "⚡", color: "#ffc107", state: "Uttar Pradesh" },
      { id: "mseb", name: "Maharashtra SEB (MSEB)", logo: "⚡", color: "#4caf50", state: "Maharashtra" },
      { id: "bescom", name: "Bangalore Electricity (BESCOM)", logo: "⚡", color: "#9c27b0", state: "Karnataka" },
      { id: "tANGEDCO", name: "Tamil Nadu Electricity (TANGEDCO)", logo: "⚡", color: "#ff5722", state: "Tamil Nadu" },
      { id: "kseb", name: "Kerala State Electricity (KSEB)", logo: "⚡", color: "#00acc1", state: "Kerala" },
      { id: "pspcl", name: "Punjab State Power (PSPCL)", logo: "⚡", color: "#7b1fa2", state: "Punjab" },
      { id: "cgseb", name: "Chhattisgarh SEB (CGSED)", logo: "⚡", color: "#3f51b5", state: "Chhattisgarh" },
      { id: "wbsedcl", name: "West Bengal SEB (WBSEDCL)", logo: "⚡", color: "#c62828", state: "West Bengal" },
      { id: "hescom", name: "Hubli Electricity (HESCOM)", logo: "⚡", color: "#00897b", state: "Karnataka" },
      { id: "cesc", name: "CESC Kolkata", logo: "⚡", color: "#fbc02d", state: "West Bengal" },
      { id: "tata_power", name: "Tata Power Mumbai", logo: "⚡", color: "#0277bd", state: "Maharashtra" },
      { id: " Torrent Power", name: "Torrent Power Ahmedabad", logo: "⚡", color: "#d32f2f", state: "Gujarat" },
      { id: "best", name: "BEST Mumbai", logo: "⚡", color: "#1976d2", state: "Maharashtra" },
    ],
    dth: [
      { id: "airtel_dth", name: "Airtel Digital TV", logo: "A", color: "#e61e2e" },
      { id: "dish_tv", name: "Dish TV", logo: "D", color: "#d32f2f" },
      { id: "sun_direct", name: "Sun Direct", logo: "S", color: "#ff9800" },
      { id: "tata_sky", name: "Tata Sky", logo: "T", color: "#1565c0" },
      { id: "videocon", name: "Videocon d2h", logo: "V", color: "#673ab7" },
      { id: "free_dish", name: "Free Dish (DD)", logo: "D", color: "#0d47a1" },
    ],
    gas: [
      { id: "png_ggcl", name: "GGCL Gujarat Gas", logo: "G", color: "#1976d2" },
      { id: "mahanagar_gas", name: "Mahanagar Gas (MGL)", logo: "M", color: "#388e3c" },
      { id: "gaeil", name: "GAIL Gas", logo: "G", color: "#0097a7" },
      { id: "indraprastha_gas", name: "IGL Delhi", logo: "I", color: "#ff5722" },
      { id: "bhagyanagar_gas", name: "Bhagyanagar Gas", logo: "B", color: "#7b1fa2" },
      { id: "siti_energy", name: "SITI Energy Gas", logo: "S", color: "#5d4037" },
    ],
    water: [
      { id: "djb", name: "Delhi Jal Board (DJB)", logo: "💧", color: "#0288d1" },
      { id: "mcgm_mumbai", name: "MCGM Mumbai Water", logo: "💧", color: "#1976d2" },
      { id: "bwssb", name: "BWSSB Bangalore", logo: "💧", color: "#00acc1" },
      { id: "twad", name: "TWAD Tamil Nadu", logo: "💧", color: "#00796b" },
      { id: "jmwsup", name: "JMV Water UP", logo: "💧", color: "#ff7043" },
      { id: "k_water", name: "Kolkata Water", logo: "💧", color: "#5e35b1" },
    ],
    insurance: [
      { id: "lic", name: "LIC India", logo: "L", color: "#0d47a1" },
      { id: "hdfc_life", name: "HDFC Life", logo: "H", color: "#c62828" },
      { id: "icici_life", name: "ICICI Prudential Life", logo: "I", color: "#d32f2f" },
      { id: "bajaj_allianz", name: "Bajaj Allianz", logo: "B", color: "#f57c00" },
      { id: "sbi_life", name: "SBI Life", logo: "S", color: "#d32f2f" },
      { id: "max_life", name: "Max Life Insurance", logo: "M", color: "#7b1fa2" },
      { id: "birla_insurance", name: "Birla Sun Life", logo: "B", color: "#c62828" },
      { id: "kotak_life", name: "Kotak Life", logo: "K", color: "#00695c" },
      { id: "aegon_life", name: "Aegon Life", logo: "A", color: "#0277bd" },
      { id: "star_health", name: "Star Health Insurance", logo: "S", color: "#00897b" },
    ],
    broadband: [
      { id: "airtel_xstream", name: "Airtel Xstream Fiber", logo: "A", color: "#e61e2e" },
      { id: "jio_fiber", name: "JioFiber", logo: "J", color: "#0f4cba" },
      { id: "bsnl_broadband", name: "BSNL Broadband", logo: "B", color: "#003974" },
      { id: "act_fibernet", name: "ACT Fibernet", logo: "A", color: "#e91e63" },
      { id: "spectranet", name: "Spectranet", logo: "S", color: "#1565c0" },
      { id: " Hathaway", name: " Hathaway Broadband", logo: "H", color: "#f57c00" },
    ],
    creditcard: [
      { id: "hdfc_cc", name: "HDFC Bank Credit Card", logo: "H", color: "#c62828" },
      { id: "icici_cc", name: "ICICI Bank Credit Card", logo: "I", color: "#d32f2f" },
      { id: "sbi_cc", name: "SBI Card", logo: "S", color: "#d32f2f" },
      { id: "axis_cc", name: "Axis Bank Credit Card", logo: "A", color: "#512da8" },
      { id: "kotak_cc", name: "Kotak Credit Card", logo: "K", color: "#00695c" },
      { id: "amex", name: "American Express", logo: "A", color: "#006fcf" },
    ],
  };

  const allBillers = activeCategory === "all" 
    ? Object.values(billers).flat() 
    : billers[activeCategory] || [];

  const handleBillerSelect = (biller) => {
    setSelectedBiller(biller);
    setFormData({ 
      ...formData, 
      billType: activeCategory === "creditcard" ? "creditcard" : activeCategory,
      billerName: biller.name 
    });
    setShowModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await transactions.bill({
        accountId: formData.accountId,
        billType: formData.billType,
        billerName: formData.billerName,
        amount: parseFloat(formData.amount),
        accountNumber: formData.accountNumber || formData.mobileNumber
      });
      setMessage("✅ Payment successful! Transaction completed.");
      setShowModal(false);
      setFormData({
        accountId: accounts[0]?._id || "",
        billType: "",
        billerName: "",
        amount: "",
        accountNumber: "",
        mobileNumber: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      telecom: "📱",
      electricity: "⚡",
      dth: "📺",
      gas: "🔥",
      water: "💧",
      insurance: "🛡️",
      broadband: "🌐",
      creditcard: "💳",
    };
    return icons[category] || "📄";
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bill Payments & Recharge</h1>
        <p className="page-subtitle">Pay bills, recharge mobile, DTH, and more - All in one place</p>
      </div>

      {message && (
        <div className={message.includes("✅") ? "success-message" : "auth-error"} style={{ marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      {/* Add Money Banner */}
      <div className="hero-card" style={{ marginBottom: "2rem", background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "0.5rem" }}>💰 Add Money to Account</div>
            <div style={{ fontSize: "2rem", fontWeight: 700 }}>Instant Payments</div>
            <div style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}>UPI • Cards • Netbanking • Wallets</div>
          </div>
          <Link to="/dashboard/add-money" className="btn" style={{ background: "white", color: "#11998e", fontWeight: 700, padding: "1rem 2rem" }}>
            Add Money ➜
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: 12,
                border: "none",
                background: activeCategory === cat.id ? "var(--gradient-primary)" : "var(--gray-100)",
                color: activeCategory === cat.id ? "white" : "var(--text)",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.3s",
                boxShadow: activeCategory === cat.id ? "0 4px 15px rgba(37, 99, 235, 0.3)" : "none"
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Billers Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{getCategoryIcon(activeCategory)} {categories.find(c => c.id === activeCategory)?.name || "All Services"}</h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{allBillers.length} providers available</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {allBillers.map((biller) => (
            <div
              key={biller.id}
              onClick={() => handleBillerSelect(biller)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                background: "var(--gray-50)",
                borderRadius: 16,
                cursor: "pointer",
                transition: "all 0.3s",
                border: "2px solid transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = biller.color || "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: biller.color || "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "1.25rem"
              }}>
                {biller.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--dark)", fontSize: "0.9rem" }}>{biller.name}</div>
                {biller.state && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{biller.state}</div>
                )}
                {biller.type && (
                  <div style={{ fontSize: "0.75rem", color: biller.type === "prepaid" ? "var(--success)" : "var(--primary)" }}>
                    {biller.type === "prepaid" ? "Prepaid" : "Postpaid"}
                  </div>
                )}
              </div>
              <div style={{ color: "var(--text-muted)" }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔒 Secure Payments</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "256-bit SSL Encryption",
              " RBI Authorized Payment Partner",
              " Instant Transaction Confirmation",
              " Secure Billers Database",
              " 24/7 Customer Support"
            ].map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ color: "var(--success)", fontSize: "1.25rem" }}>✓</span>
                <span style={{ fontSize: "0.9rem" }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Quick Tips</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Keep your consumer number handy for electricity bills",
              "Enter correct mobile number for prepaid recharge",
              "DTH recharge requires smart card number",
              "Check bill due date to avoid late fees",
              "Save your biller for faster next payment"
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ color: "var(--warning)", fontSize: "1rem", marginTop: "2px" }}>•</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: selectedBiller?.color || "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.25rem"
                }}>
                  {selectedBiller?.logo}
                </div>
                <div>
                  <h3 className="modal-title" style={{ marginBottom: 0 }}>{selectedBiller?.name}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {selectedBiller?.state || (selectedBiller?.type === "prepaid" ? "Prepaid" : selectedBiller?.type === "postpaid" ? "Postpaid" : "Bill Payment")}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label className="form-label">Pay From Account</label>
                <select
                  className="form-input"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.bankName} - ****{account.accountNumber?.slice(-4)} (₹{account.availableBalance?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {(activeCategory === "telecom" || activeCategory === "dth" || activeCategory === "broadband") && (
                <div className="form-group">
                  <label className="form-label">
                    {activeCategory === "telecom" ? "Mobile Number" : activeCategory === "dth" ? "Subscriber ID / Smart Card Number" : "Broadband Account Number"}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={activeCategory === "telecom" ? "Enter 10-digit mobile number" : "Enter your ID number"}
                    value={formData.mobileNumber || formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, [activeCategory === "telecom" ? "mobileNumber" : "accountNumber"]: e.target.value })}
                    required
                  />
                </div>
              )}

              {activeCategory === "electricity" && (
                <div className="form-group">
                  <label className="form-label">Consumer Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter consumer/billing number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Find on your electricity bill
                  </p>
                </div>
              )}

              {activeCategory === "insurance" && (
                <div className="form-group">
                  <label className="form-label">Policy Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter policy number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 600 }}>₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    min="1"
                    required
                    style={{ paddingLeft: "2rem" }}
                  />
                </div>
              </div>

              <div style={{ 
                background: "var(--gray-50)", 
                padding: "1rem", 
                borderRadius: 12, 
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <span style={{ fontSize: "1.5rem" }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Processing Time</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Instant confirmation for most payments</div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || accounts.length === 0} style={{ padding: "1rem" }}>
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <span>Pay ₹{formData.amount || "0"} →</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
