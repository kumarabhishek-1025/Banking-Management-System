import React, { useState, useEffect } from "react";
import { deposits as depositsApi, accounts as accountsApi } from "../services/api";

const FixedDeposits = () => {
  const [fds, setFds] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formData, setFormData] = useState({ accountId: "", amount: "", tenureMonths: "" });
  const [calculation, setCalculation] = useState(null);
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const isSeniorCitizen = user.dateOfBirth && (new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) >= 60;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fdRes, accountRes, schemeRes] = await Promise.all([
        depositsApi.getMyFDs(),
        accountsApi.getAll(),
        depositsApi.getSchemes("fixed")
      ]);
      setFds(fdRes.data || []);
      setAccounts(accountRes.data.accounts || []);
      setSchemes(schemeRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReturns = (scheme, amount, months) => {
    const rate = isSeniorCitizen && scheme.seniorCitizenRate 
      ? scheme.seniorCitizenRate 
      : (scheme.specialRate && amount >= scheme.specialRateMinAmount && months === scheme.specialRateTenureMonths)
        ? scheme.specialRate 
        : scheme.interestRate;
    
    const principal = parseFloat(amount);
    const time = months / 12;
    
    let maturityAmount;
    if (scheme.interestType === "compound") {
      const freq = scheme.compoundingFrequency === "monthly" ? 12 : scheme.compoundingFrequency === "quarterly" ? 4 : 1;
      maturityAmount = principal * Math.pow(1 + (rate / 100) / freq, freq * time);
    } else {
      maturityAmount = principal + (principal * rate * time / 100);
    }
    
    const interestEarned = maturityAmount - principal;
    
    return {
      rate,
      maturityAmount: Math.round(maturityAmount),
      interestEarned: Math.round(interestEarned),
      principal
    };
  };

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme);
    setFormData({ accountId: "", amount: "", tenureMonths: Math.min(12, scheme.maxTenureMonths).toString() });
    setCalculation(null);
    setShowApplyModal(true);
  };

  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value });
    if (value && formData.tenureMonths && selectedScheme) {
      const calc = calculateReturns(selectedScheme, value, parseInt(formData.tenureMonths));
      setCalculation(calc);
    }
  };

  const handleTenureChange = (value) => {
    setFormData({ ...formData, tenureMonths: value });
    if (value && formData.amount && selectedScheme) {
      const calc = calculateReturns(selectedScheme, formData.amount, parseInt(value));
      setCalculation(calc);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amount || !formData.tenureMonths) {
      alert("Please fill all fields");
      return;
    }
    
    try {
      await depositsApi.createFD({
        accountId: formData.accountId,
        schemeId: selectedScheme._id,
        amount: parseFloat(formData.amount),
        tenureMonths: parseInt(formData.tenureMonths)
      });
      alert("Fixed Deposit created successfully!");
      setShowApplyModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create FD");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatMonths = (months) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return `${years} Year${years > 1 ? 's' : ''}`;
    }
    return `${months} Months`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="text-4xl mt-4">🏦</div>
          </div>
          <p className="text-gray-600 text-xl mt-6 font-semibold">Loading Fixed Deposits...</p>
          <p className="text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "2rem" }}>
      <div className="page-header" style={{ padding: "2rem 2rem 1rem", background: "white", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>📊</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Fixed Deposits</h1>
            <p className="page-subtitle">Secure your future with guaranteed returns</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem" }}>
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          {[
            { label: "Highest Rate", value: "7.5%", icon: "📈", color: "#10b981" },
            { label: "Min Deposit", value: "₹1,000", icon: "💰", color: "#3b82f6" },
            { label: "Max Tenure", value: "10 Years", icon: "📅", color: "#6366f1" },
            { label: "Safety", value: "100% FDIC", icon: "🔒", color: "#f59e0b" }
          ].map((item, i) => (
            <div key={i} className="stat-card" style={{ borderLeft: `4px solid ${item.color}` }}>
              <div className="stat-header">
                <div>
                  <div className="stat-label">{item.label}</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{item.value}</div>
                </div>
                <div style={{ fontSize: "1.5rem" }}>{item.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {fds.length > 0 && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div className="card-header">
              <h3 className="card-title">My Fixed Deposits ({fds.length})</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {fds.map((fd) => (
                <div key={fd._id} style={{ background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)", borderRadius: 16, padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>FD Number</div>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{fd.fdNumber || `FD${fd._id.slice(-8).toUpperCase()}`}</div>
                    </div>
                    <span className="badge badge-success">{fd.status || "Active"}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1.125rem", color: "#1e293b", marginBottom: "0.75rem" }}>{fd.schemeName || "Fixed Deposit"}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ background: "white", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Principal</div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{formatCurrency(fd.amount)}</div>
                    </div>
                    <div style={{ background: "linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#3b82f6" }}>Maturity</div>
                      <div style={{ fontWeight: 600, color: "#2563eb" }}>{formatCurrency(fd.maturityAmount || fd.amount * 1.08)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#64748b" }}>
                    <span>{formatMonths(fd.tenureMonths || 12)}</span>
                    <span>{fd.interestRate || 6.5}% p.a.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available Schemes ({schemes.length})</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {schemes.map((scheme) => (
              <div key={scheme._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white" }}>
                <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                      {scheme.isDefault && (
                        <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", color: "white", fontWeight: 600 }}>⭐ Popular</span>
                      )}
                      <span style={{ background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", color: "white" }}>Fixed Deposit</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{scheme.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", lineHeight: 1 }}>{scheme.interestRate}%</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>Annual Rate</div>
                  </div>
                </div>
                
                <div style={{ padding: "1.25rem 1.5rem" }}>
                  <p style={{ color: "#64748b", marginBottom: "1rem" }}>{scheme.description}</p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                    {[
                      { label: "Min Deposit", value: formatCurrency(scheme.minAmount) },
                      { label: "Max Deposit", value: formatCurrency(scheme.maxAmount) },
                      { label: "Tenure", value: `${formatMonths(scheme.minTenureMonths)} - ${formatMonths(scheme.maxTenureMonths)}` },
                      { label: "Interest", value: scheme.interestType }
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.25rem" }}>{item.label}</div>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {(scheme.seniorCitizenRate || scheme.specialRate) && (
                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                      {scheme.seniorCitizenRate && (
                        <span style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", padding: "0.5rem 1rem", borderRadius: 20, fontSize: "0.875rem", color: "#92400e", fontWeight: 600 }}>
                          👴 Senior: {scheme.seniorCitizenRate}%
                        </span>
                      )}
                      {scheme.specialRate && (
                        <span style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", padding: "0.5rem 1rem", borderRadius: 20, fontSize: "0.875rem", color: "#065f46", fontWeight: 600 }}>
                          🎁 Special: {scheme.specialRate}%
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {scheme.features && (
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem", fontSize: "0.9rem" }}>✓ Key Features</div>
                        <ul style={{ fontSize: "0.8rem", color: "#64748b", paddingLeft: "1.25rem" }}>
                          {scheme.features.slice(0, 3).map((f, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scheme.terms && (
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📋 Terms</div>
                        <ul style={{ fontSize: "0.8rem", color: "#64748b", paddingLeft: "1.25rem" }}>
                          {scheme.terms.slice(0, 3).map((t, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleSelectScheme(scheme)}
                    style={{ width: "100%", marginTop: "1.25rem", padding: "0.875rem", background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "2rem" }}>💡</div>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "1.125rem", marginBottom: "0.5rem" }}>Important Information</div>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Interest rates are subject to change. Senior citizen rates (60+ years). Tax benefits under Section 80C for 5-year lock-in period. Contact branch for latest rates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && selectedScheme && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setShowApplyModal(false)}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 480, width: "100%", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{selectedScheme.name}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>Create Fixed Deposit</div>
              </div>
              <button onClick={() => setShowApplyModal(false)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>🏦 Select Account</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  style={{ width: "100%", padding: "0.875rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", background: "white" }}
                  required
                >
                  <option value="">Choose your account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountNumber} - {formatCurrency(acc.balance)} ({acc.status})
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.5rem" }}>⚠️ No accounts found. Create an account first.</p>
                )}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>💰 Deposit Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder={`Min: ${formatCurrency(selectedScheme.minAmount)}`}
                  min={selectedScheme.minAmount}
                  max={selectedScheme.maxAmount}
                  style={{ width: "100%", padding: "0.875rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Min: {formatCurrency(selectedScheme.minAmount)} | Max: {formatCurrency(selectedScheme.maxAmount)}</p>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📅 Tenure</label>
                <select
                  value={formData.tenureMonths}
                  onChange={(e) => handleTenureChange(e.target.value)}
                  style={{ width: "100%", padding: "0.875rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", background: "white" }}
                  required
                >
                  {[...Array(Math.floor((selectedScheme.maxTenureMonths - selectedScheme.minTenureMonths) / 6) + 1)].map((_, i) => {
                    const month = selectedScheme.minTenureMonths + (i * 6);
                    if (month <= selectedScheme.maxTenureMonths) {
                      return (
                        <option key={month} value={month}>{formatMonths(month)}</option>
                      );
                    }
                    return null;
                  })}
                </select>
              </div>

              {calculation && (
                <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0", marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 600, color: "#166534", marginBottom: "0.75rem" }}>📊 Maturity Preview</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div style={{ textAlign: "center", padding: "0.5rem", background: "white", borderRadius: 8 }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Principal</div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{formatCurrency(calculation.principal)}</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0.5rem", background: "white", borderRadius: 8 }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Interest Rate</div>
                      <div style={{ fontWeight: 600, color: "#2563eb" }}>{calculation.rate}%</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0.5rem", background: "white", borderRadius: 8 }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Interest Earned</div>
                      <div style={{ fontWeight: 600, color: "#059669" }}>+{formatCurrency(calculation.interestEarned)}</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0.5rem", background: "white", borderRadius: 8 }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Maturity Amount</div>
                      <div style={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(calculation.maturityAmount)}</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!formData.accountId || !formData.amount || !formData.tenureMonths}
                style={{ width: "100%", padding: "1rem", background: formData.accountId && formData.amount && formData.tenureMonths ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" : "#94a3b8", color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: formData.accountId && formData.amount && formData.tenureMonths ? "pointer" : "not-allowed" }}
              >
                Create Fixed Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedDeposits;