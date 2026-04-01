import React, { useState, useEffect } from "react";
import { deposits as depositsApi, accounts as accountsApi } from "../services/api";

const RecurringDeposits = () => {
  const [rds, setRds] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ schemeId: "", accountId: "", monthlyAmount: "" });
  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rdRes, accountRes, schemeRes] = await Promise.all([
        depositsApi.getMyRDs(),
        accountsApi.getAll(),
        depositsApi.getSchemes("recurring")
      ]);
      setRds(rdRes.data || []);
      setAccounts(accountRes.data.accounts?.filter(a => a.status === "active") || []);
      setSchemes(schemeRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.schemeId && formData.monthlyAmount) {
      calculateMaturity();
    } else {
      setCalculation(null);
    }
  }, [formData.schemeId, formData.monthlyAmount]);

  const calculateMaturity = async () => {
    try {
      const res = await depositsApi.calculateRD({ schemeId: formData.schemeId, monthlyAmount: parseFloat(formData.monthlyAmount) });
      setCalculation(res.data);
    } catch (error) {
      setCalculation(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await depositsApi.createRD(formData);
      alert("Recurring Deposit created successfully!");
      setShowModal(false);
      setFormData({ schemeId: "", accountId: "", monthlyAmount: "" });
      setCalculation(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create RD");
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const activeRDs = rds.filter(rd => rd.status === "active");
  const completedRDs = rds.filter(rd => rd.status === "completed");

  const calculateProgress = (rd) => {
    return Math.round((rd.depositCount / rd.tenureMonths) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="text-4xl mt-4">📈</div>
          </div>
          <p className="text-gray-600 text-xl mt-6 font-semibold">Loading Recurring Deposits...</p>
          <p className="text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "2rem" }}>
      <div className="page-header" style={{ padding: "2rem 2rem 1rem", background: "white", marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>📈</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Recurring Deposits</h1>
            <p className="page-subtitle">Build your savings step by step</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.5rem 2rem" }}>
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          {[
            { label: "Highest Rate", value: "6.5%", icon: "📈", color: "#10b981" },
            { label: "Min Monthly", value: "₹500", icon: "💰", color: "#3b82f6" },
            { label: "Max Tenure", value: "10 Years", icon: "📅", color: "#6366f1" },
            { label: "Flexible", value: "Any Bank", icon: "🏦", color: "#f59e0b" }
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

        {rds.length > 0 && (
          <>
            {activeRDs.length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-header">
                  <h3 className="card-title">My Active RDs ({activeRDs.length})</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                  {activeRDs.map((rd) => (
                    <div key={rd._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white" }}>
                      <div style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>{rd.schemeName || "Recurring Deposit"}</div>
                          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>**** {rd.account?.accountNumber?.slice(-4)}</div>
                        </div>
                        <span className="badge badge-success">Active</span>
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Monthly</div>
                            <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{formatCurrency(rd.monthlyAmount)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Interest</div>
                            <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{rd.interestRate}%</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Maturity</div>
                            <div style={{ fontWeight: 600, fontSize: "1.125rem", color: "#059669" }}>{formatCurrency(rd.maturityAmount)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Tenure</div>
                            <div style={{ fontWeight: 600, fontSize: "1.125rem" }}>{rd.tenureMonths} mo</div>
                          </div>
                        </div>
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                            <span style={{ color: "#64748b" }}>Progress</span>
                            <span style={{ color: "#64748b" }}>{rd.depositCount}/{rd.tenureMonths} ({calculateProgress(rd)}%)</span>
                          </div>
                          <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${calculateProgress(rd)}%`, height: "100%", background: "linear-gradient(90deg, #06b6d4, #0891b2)", transition: "width 0.3s" }} />
                          </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", justifyContent: "space-between" }}>
                          <span>Deposits: {rd.depositCount}</span>
                          <span>Maturity: {formatDate(rd.maturityDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedRDs.length > 0 && (
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div className="card-header">
                  <h3 className="card-title">Completed RDs ({completedRDs.length})</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {completedRDs.map((rd) => (
                    <div key={rd._id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{rd.schemeName || "RD"}</div>
                        <span className="badge badge-success">Completed</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Monthly</div>
                          <div style={{ fontWeight: 500 }}>{formatCurrency(rd.monthlyAmount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Deposited</div>
                          <div style={{ fontWeight: 500 }}>{formatCurrency(rd.totalDeposited)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Maturity</div>
                          <div style={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(rd.maturityAmount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Completed</div>
                          <div style={{ fontWeight: 500 }}>{formatDate(rd.maturityDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available Schemes ({schemes.length})</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {schemes.map((scheme) => (
              <div key={scheme._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white" }}>
                <div style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                      {scheme.isDefault && (
                        <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", color: "white", fontWeight: 600 }}>⭐ Popular</span>
                      )}
                      <span style={{ background: "rgba(255,255,255,0.15)", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", color: "white" }}>Recurring Deposit</span>
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
                      { label: "Min Monthly", value: formatCurrency(scheme.minAmount) },
                      { label: "Max Monthly", value: formatCurrency(scheme.maxAmount) },
                      { label: "Tenure", value: `${scheme.minTenureMonths}-${scheme.maxTenureMonths} mo` },
                      { label: "Interest", value: scheme.interestType }
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: 8 }}>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "0.25rem" }}>{item.label}</div>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {scheme.seniorCitizenRate && (
                    <div style={{ marginBottom: "1rem" }}>
                      <span style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", padding: "0.5rem 1rem", borderRadius: 20, fontSize: "0.875rem", color: "#92400e", fontWeight: 600 }}>
                        👴 Senior Citizen: {scheme.seniorCitizenRate}%
                      </span>
                    </div>
                  )}

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
                      setFormData({ schemeId: scheme._id, accountId: "", monthlyAmount: "" });
                      setCalculation(null);
                      setShowModal(true);
                    }}
                    style={{ width: "100%", marginTop: "0.5rem", padding: "0.875rem", background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    Start RD →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ fontSize: "2rem" }}>💡</div>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "1.125rem", marginBottom: "0.5rem" }}>How Recurring Deposits Work</div>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Deposit a fixed amount monthly for your chosen tenure. Earn guaranteed interest compounded quarterly. Auto-renewal option available. Senior citizen benefits apply for ages 60+.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 480, width: "100%", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>Create RD</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>Start your recurring deposit</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <form onSubmit={handleCreate} style={{ padding: "1.5rem" }}>
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
                <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>💰 Monthly Amount (₹)</label>
                <input
                  type="number"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                  placeholder="Enter monthly amount"
                  style={{ width: "100%", padding: "0.875rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                  required
                />
                {formData.schemeId && schemes.find(s => s._id === formData.schemeId) && (
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Min: {formatCurrency(schemes.find(s => s._id === formData.schemeId).minAmount)} | Max: {formatCurrency(schemes.find(s => s._id === formData.schemeId).maxAmount)}/month
                  </p>
                )}
              </div>

              {calculation && (
                <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0", marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 600, color: "#166534", marginBottom: "0.75rem" }}>📊 RD Preview</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.875rem" }}>
                    <div style={{ color: "#64748b" }}>Monthly:</div>
                    <div style={{ fontWeight: 500 }}>{formatCurrency(parseFloat(formData.monthlyAmount))}</div>
                    <div style={{ color: "#64748b" }}>Rate:</div>
                    <div style={{ fontWeight: 500 }}>{calculation.interestRate}%</div>
                    <div style={{ color: "#64748b" }}>Total:</div>
                    <div style={{ fontWeight: 500 }}>{formatCurrency(calculation.totalDeposited)}</div>
                    <div style={{ color: "#64748b" }}>Interest:</div>
                    <div style={{ fontWeight: 500, color: "#059669" }}>+{formatCurrency(calculation.totalInterest)}</div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>Maturity:</div>
                    <div style={{ fontWeight: 600, color: "#059669" }}>{formatCurrency(calculation.maturityAmount)}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!formData.accountId || !formData.monthlyAmount}
                style={{ width: "100%", padding: "1rem", background: formData.accountId && formData.monthlyAmount ? "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" : "#94a3b8", color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "1rem", cursor: formData.accountId && formData.monthlyAmount ? "pointer" : "not-allowed" }}
              >
                Create Recurring Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringDeposits;