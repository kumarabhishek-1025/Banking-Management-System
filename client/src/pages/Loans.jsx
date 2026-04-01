import React, { useState, useEffect } from "react";
import { loans as loansApi, accounts as accountsApi } from "../services/api";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formData, setFormData] = useState({ accountId: "", amount: "", tenure: "12", purpose: "personal" });
  const [emiCalc, setEmiCalc] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loanRes, accountRes, schemeRes] = await Promise.all([
        loansApi.getMyLoans(),
        accountsApi.getAll(),
        loansApi.getSchemes ? loansApi.getSchemes() : Promise.resolve({ data: [] })
      ]);
      setLoans(loanRes.data || []);
      setAccounts(accountRes.data.accounts || []);
      
      if (schemeRes.data && schemeRes.data.length > 0) {
        setSchemes(schemeRes.data);
      } else {
        setSchemes([
          { _id: "1", name: "Personal Loan", type: "personal", description: "Unsecured loan for personal expenses", minAmount: 50000, maxAmount: 2000000, interestRate: 12, tenureMin: 12, tenureMax: 60, features: ["No collateral required", "Quick approval"], terms: ["Processing fee: 2.5%", "CIBIL score 650+"] },
          { _id: "2", name: "Home Loan", type: "home", description: "Buy your dream home with low interest rates", minAmount: 100000, maxAmount: 50000000, interestRate: 8.5, tenureMin: 60, tenureMax: 360, features: ["Tax benefits", "Low EMI"], terms: ["Processing fee: 0.5%", "Property verification"] },
          { _id: "3", name: "Car Loan", type: "car", description: "Finance your new car with attractive rates", minAmount: 100000, maxAmount: 5000000, interestRate: 9.5, tenureMin: 12, tenureMax: 84, features: ["100% financing", "Quick approval"], terms: ["Processing fee: 1%", "Insurance mandatory"] },
          { _id: "4", name: "Education Loan", type: "education", description: "Fund your higher education in India or abroad", minAmount: 50000, maxAmount: 20000000, interestRate: 8, tenureMin: 12, tenureMax: 180, features: ["Moratorium period", "Tax benefits"], terms: ["Processing fee: 0.5%", "Admission proof required"] },
          { _id: "5", name: "Business Loan", type: "business", description: "Grow your business with flexible funding", minAmount: 100000, maxAmount: 10000000, interestRate: 14, tenureMin: 12, tenureMax: 60, features: ["Unsecured upto 50L", "Quick disbursement"], terms: ["Processing fee: 2%", "Business vintage 2+ years"] }
        ]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setSchemes([
        { _id: "1", name: "Personal Loan", type: "personal", description: "Unsecured loan for personal expenses", minAmount: 50000, maxAmount: 2000000, interestRate: 12, tenureMin: 12, tenureMax: 60, features: ["No collateral required", "Quick approval"], terms: ["Processing fee: 2.5%", "CIBIL score 650+"] },
        { _id: "2", name: "Home Loan", type: "home", description: "Buy your dream home with low interest rates", minAmount: 100000, maxAmount: 50000000, interestRate: 8.5, tenureMin: 60, tenureMax: 360, features: ["Tax benefits", "Low EMI"], terms: ["Processing fee: 0.5%", "Property verification"] },
        { _id: "3", name: "Car Loan", type: "car", description: "Finance your new car with attractive rates", minAmount: 100000, maxAmount: 5000000, interestRate: 9.5, tenureMin: 12, tenureMax: 84, features: ["100% financing", "Quick approval"], terms: ["Processing fee: 1%", "Insurance mandatory"] },
        { _id: "4", name: "Education Loan", type: "education", description: "Fund your higher education in India or abroad", minAmount: 50000, maxAmount: 20000000, interestRate: 8, tenureMin: 12, tenureMax: 180, features: ["Moratorium period", "Tax benefits"], terms: ["Processing fee: 0.5%", "Admission proof required"] },
        { _id: "5", name: "Business Loan", type: "business", description: "Grow your business with flexible funding", minAmount: 100000, maxAmount: 10000000, interestRate: 14, tenureMin: 12, tenureMax: 60, features: ["Unsecured upto 50L", "Quick disbursement"], terms: ["Processing fee: 2%", "Business vintage 2+ years"] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await loansApi.apply(formData);
      alert("Loan application submitted successfully!");
      setShowModal(false);
      setFormData({ accountId: "", amount: "", tenure: "12", purpose: "personal" });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply for loan");
    }
  };

  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value });
    if (value && formData.tenure && selectedScheme) {
      calculateEMI(value, formData.tenure, selectedScheme.interestRate);
    }
  };

  const handleTenureChange = (value) => {
    setFormData({ ...formData, tenure: value });
    if (formData.amount && value && selectedScheme) {
      calculateEMI(formData.amount, value, selectedScheme.interestRate);
    }
  };

  const calculateEMI = (amount, tenure, rate = 12) => {
    const monthlyRate = rate / 100 / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    setEmiCalc({
      emi: emi.toFixed(2),
      total: (emi * tenure).toFixed(2),
      interest: (emi * tenure - amount).toFixed(2)
    });
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

  const schemeColors = {
    personal: { from: "from-blue-600", to: "to-indigo-600", bg: "linear-gradient(135deg, #2563eb 0%, #6366f1 100%)" },
    home: { from: "from-emerald-600", to: "to-teal-600", bg: "linear-gradient(135deg, #059669 0%, #0d9488 100%)" },
    car: { from: "from-amber-600", to: "to-orange-600", bg: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)" },
    education: { from: "from-violet-600", to: "to-purple-600", bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" },
    business: { from: "from-rose-600", to: "to-pink-600", bg: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="text-4xl mt-4">🏠</div>
          </div>
          <p className="text-gray-600 text-xl mt-6 font-semibold">Loading Loans...</p>
          <p className="text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "2rem" }}>
      <div className="page-header" style={{ padding: "2rem 2rem 1rem", background: "white", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>🏠</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Loans</h1>
            <p className="page-subtitle">Fulfill your dreams with flexible loan options</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem" }}>
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          {[
            { label: "Total Loans", value: loans.length || 0, icon: "📋", color: "#7c3aed" },
            { label: "Applied Amount", value: formatCurrency(loans.reduce((sum, l) => sum + l.amount, 0)), icon: "💰", color: "#059669" },
            { label: "Pending", value: loans.filter(l => l.status === "pending").length || 0, icon: "⏳", color: "#d97706" },
            { label: "Approved", value: loans.filter(l => l.status === "approved").length || 0, icon: "✅", color: "#2563eb" }
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

        {loans.length > 0 && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div className="card-header">
              <h3 className="card-title">My Loans ({loans.length})</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
              {loans.map((loan) => {
                const colors = schemeColors[loan.purpose] || schemeColors.personal;
                return (
                  <div key={loan._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ background: colors.bg, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>{loan.purpose} Loan</div>
                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>Applied on {new Date(loan.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`badge ${loan.status === 'approved' ? 'badge-success' : loan.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {loan.status}
                      </span>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Amount</div>
                          <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{formatCurrency(loan.amount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Interest</div>
                          <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{loan.interestRate}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Tenure</div>
                          <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{loan.tenure} months</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Monthly EMI</div>
                          <div style={{ fontWeight: 600, fontSize: "1.125rem", color: "#059669" }}>{formatCurrency(loan.monthlyEmi)}</div>
                        </div>
                      </div>
                      <div style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                        <span style={{ color: "#64748b" }}>Total Repayable</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{formatCurrency(loan.totalRepayable)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available Loan Schemes ({schemes.length})</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {schemes.map((scheme) => {
              const colors = schemeColors[scheme.type] || schemeColors.personal;
              return (
                <div key={scheme._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white" }}>
                  <div style={{ background: colors.bg, padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", color: "white" }}>{scheme.type} Loan</span>
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
                        { label: "Min Amount", value: formatCurrency(scheme.minAmount) },
                        { label: "Max Amount", value: scheme.maxAmount ? formatCurrency(scheme.maxAmount) : "No limit" },
                        { label: "Tenure", value: `${formatMonths(scheme.tenureMin)} - ${formatMonths(scheme.tenureMax)}` },
                        { label: "Processing Fee", value: scheme.processingFee ? `${scheme.processingFee}%` : "N/A" }
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: 8 }}>
                          <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.25rem" }}>{item.label}</div>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {scheme.features && scheme.features.length > 0 && (
                      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
                        <div style={{ fontWeight: 600, color: "#0369a1", marginBottom: "0.5rem", fontSize: "0.9rem" }}>✓ Key Features</div>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "#075985" }}>
                          {scheme.features.map((f, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scheme.terms && scheme.terms.length > 0 && (
                      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f5f3ff", borderRadius: 10, border: "1px solid #c4b5fd" }}>
                        <div style={{ fontWeight: 600, color: "#7c3aed", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📋 Terms & Conditions</div>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "#6d28d9" }}>
                          {scheme.terms.map((t, i) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setSelectedScheme(scheme);
                        setFormData({ ...formData, purpose: scheme.type, accountId: "", amount: "", tenure: scheme.tenureMin.toString() });
                        setEmiCalc(null);
                        setShowModal(true);
                      }}
                      style={{ width: "100%", marginTop: "0.5rem", padding: "0.875rem", background: colors.bg, color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "transform 0.2s" }}
                      onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                      onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "2rem" }}>💡</div>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "1.125rem", marginBottom: "0.5rem" }}>Eligibility Criteria</div>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Age 21-65 years, minimum income ₹25,000/month, CIBIL score 650+. Processing time: 24-72 hours. Documents required: ID proof, address proof, income proof, bank statements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedScheme && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 480, width: "100%", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{selectedScheme.name}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>Apply for loan</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <form onSubmit={handleApply} style={{ padding: "1.5rem" }}>
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
                      {acc.accountNumber} - {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>💰 Loan Amount (₹)</label>
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
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Min: {formatCurrency(selectedScheme.minAmount)} | Max: {selectedScheme.maxAmount ? formatCurrency(selectedScheme.maxAmount) : "No limit"}
                </p>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📅 Tenure (Months)</label>
                <select
                  value={formData.tenure}
                  onChange={(e) => handleTenureChange(e.target.value)}
                  style={{ width: "100%", padding: "0.875rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", background: "white" }}
                  required
                >
                  {[12, 24, 36, 48, 60].map(m => (
                    m >= selectedScheme.tenureMin && m <= selectedScheme.tenureMax && (
                      <option key={m} value={m}>{m} Months</option>
                    )
                  ))}
                </select>
              </div>

              {emiCalc && (
                <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0", marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 600, color: "#166534", marginBottom: "0.75rem" }}>📊 EMI Preview</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <div style={{ color: "#64748b" }}>Monthly EMI:</div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>₹{parseFloat(emiCalc.emi).toLocaleString()}</div>
                    <div style={{ color: "#64748b" }}>Total Interest:</div>
                    <div style={{ fontWeight: 500, color: "#dc2626" }}>₹{parseFloat(emiCalc.interest).toLocaleString()}</div>
                    <div style={{ color: "#64748b", fontWeight: 600 }}>Total Repayment:</div>
                    <div style={{ fontWeight: 600, color: "#059669" }}>₹{parseFloat(emiCalc.total).toLocaleString()}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!formData.accountId || !formData.amount || !formData.tenure}
                style={{ width: "100%", padding: "1rem", background: formData.accountId && formData.amount && formData.tenure ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : "#94a3b8", color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: formData.accountId && formData.amount && formData.tenure ? "pointer" : "not-allowed" }}
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;