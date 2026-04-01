import React, { useState, useEffect } from "react";
import { admin, deposits as depositsApi } from "../../services/api";

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fd");
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemeForm, setSchemeForm] = useState({
    name: "", type: "fixed", description: "", minAmount: "", maxAmount: "", 
    minTenureMonths: "", maxTenureMonths: "", interestRate: "", seniorCitizenRate: "",
    specialRate: "", specialRateMinAmount: "", isActive: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schemeRes, fdRes, rdRes] = await Promise.all([
        admin.getDepositSchemes(),
        depositsApi.getAllFDs(),
        depositsApi.getAllRDs()
      ]);
      setSchemes(schemeRes.data || []);
      setDeposits(activeTab === "fd" ? fdRes.data : rdRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...schemeForm,
        minAmount: parseFloat(schemeForm.minAmount),
        maxAmount: schemeForm.maxAmount ? parseFloat(schemeForm.maxAmount) : null,
        minTenureMonths: parseInt(schemeForm.minTenureMonths),
        maxTenureMonths: parseInt(schemeForm.maxTenureMonths),
        interestRate: parseFloat(schemeForm.interestRate),
        seniorCitizenRate: schemeForm.seniorCitizenRate ? parseFloat(schemeForm.seniorCitizenRate) : null,
        specialRate: schemeForm.specialRate ? parseFloat(schemeForm.specialRate) : null,
        specialRateMinAmount: schemeForm.specialRateMinAmount ? parseFloat(schemeForm.specialRateMinAmount) : null
      };
      
      if (editingScheme) {
        await admin.updateDepositScheme(editingScheme._id, data);
      } else {
        await admin.createDepositScheme(data);
      }
      setShowSchemeModal(false);
      setEditingScheme(null);
      setSchemeForm({ name: "", type: "fixed", description: "", minAmount: "", maxAmount: "", minTenureMonths: "", maxTenureMonths: "", interestRate: "", seniorCitizenRate: "", specialRate: "", specialRateMinAmount: "", isActive: true });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save scheme");
    }
  };

  const handleEditScheme = (scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      name: scheme.name, type: scheme.type, description: scheme.description || "",
      minAmount: scheme.minAmount, maxAmount: scheme.maxAmount || "",
      minTenureMonths: scheme.minTenureMonths, maxTenureMonths: scheme.maxTenureMonths,
      interestRate: scheme.interestRate, seniorCitizenRate: scheme.seniorCitizenRate || "",
      specialRate: scheme.specialRate || "", specialRateMinAmount: scheme.specialRateMinAmount || "",
      isActive: scheme.isActive
    });
    setShowSchemeModal(true);
  };

  const handleDeleteScheme = async (scheme) => {
    if (!confirm(`Delete scheme "${scheme.name}"?`)) return;
    try {
      await admin.deleteDepositScheme(scheme._id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  
  const getStatusLabel = (status) => {
    const labels = {
      active: { text: "Active", color: "#059669", bg: "#d1fae5" },
      pending: { text: "Pending", color: "#d97706", bg: "#fef3c7" },
      rejected: { text: "Rejected", color: "#dc2626", bg: "#fee2e2" },
      matured: { text: "Matured", color: "#7c3aed", bg: "#ede9fe" },
      completed: { text: "Completed", color: "#059669", bg: "#d1fae5" },
      withdrawn: { text: "Withdrawn", color: "#d97706", bg: "#fef3c7" },
      customer_deleted: { text: "Customer Deleted", color: "#dc2626", bg: "#fee2e2" },
      withdrawn_early: { text: "Early Withdrawal", color: "#d97706", bg: "#fef3c7" },
      closed_by_customer: { text: "Closed by Customer", color: "#d97706", bg: "#fef3c7" },
      closed_by_admin: { text: "Closed by Admin", color: "#dc2626", bg: "#fee2e2" }
    };
    return labels[status] || { text: status, color: "#64748b", bg: "#f1f5f9" };
  };

  const formatMonths = (months) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return `${years} Year${years > 1 ? 's' : ''}`;
    }
    return `${months} Months`;
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="page-header" style={{ marginBottom: "1.5rem", padding: 0, background: "transparent" }}>
        <h1 className="page-title">Deposits Management</h1>
        <p className="page-subtitle">Manage Fixed Deposits, Recurring Deposits & Schemes</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "white", padding: "0.5rem", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {[
          { id: "fd", label: "📈 Fixed Deposits" },
          { id: "rd", label: "📊 Recurring Deposits" },
          { id: "schemes", label: "⚙️ Schemes" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.75rem 1.25rem",
              border: "none",
              borderRadius: 8,
              fontWeight: 500,
              cursor: "pointer",
              background: activeTab === tab.id ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" : "transparent",
              color: activeTab === tab.id ? "white" : "#64748b",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "schemes" ? (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className="card-title">Deposit Schemes ({schemes.length})</h3>
            <button 
              onClick={() => { setEditingScheme(null); setSchemeForm({ name: "", type: "fixed", description: "", minAmount: "", maxAmount: "", minTenureMonths: "", maxTenureMonths: "", interestRate: "", seniorCitizenRate: "", specialRate: "", specialRateMinAmount: "", isActive: true }); setShowSchemeModal(true); }}
              style={{ padding: "0.625rem 1.25rem", background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              + Add Scheme
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
            {schemes.map((scheme) => (
              <div key={scheme._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white" }}>
                <div style={{ 
                  background: scheme.type === "fixed" 
                    ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" 
                    : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", 
                  padding: "1rem 1.25rem", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center" 
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}>{scheme.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>{scheme.type === "fixed" ? "Fixed Deposit" : "Recurring Deposit"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", lineHeight: 1 }}>{scheme.interestRate}%</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)" }}>Interest Rate</div>
                  </div>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", minHeight: "40px" }}>{scheme.description || "No description"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Min Amount</div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{formatCurrency(scheme.minAmount)}</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Max Amount</div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{scheme.maxAmount ? formatCurrency(scheme.maxAmount) : "No limit"}</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Tenure</div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{formatMonths(scheme.minTenureMonths)} - {formatMonths(scheme.maxTenureMonths)}</div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Status</div>
                      <div style={{ fontWeight: 600, color: scheme.isActive ? "#059669" : "#dc2626" }}>{scheme.isActive ? "Active" : "Inactive"}</div>
                    </div>
                  </div>
                  {scheme.seniorCitizenRate && (
                    <div style={{ marginBottom: "1rem" }}>
                      <span style={{ background: "#fef3c7", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.8rem", color: "#92400e", fontWeight: 500 }}>
                        👴 Senior: {scheme.seniorCitizenRate}%
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => handleEditScheme(scheme)}
                      style={{ flex: 1, padding: "0.5rem", background: "#f1f5f9", color: "#3b82f6", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteScheme(scheme)}
                      style={{ flex: 1, padding: "0.5rem", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, fontWeight: 500, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{activeTab === "fd" ? "Fixed Deposits" : "Recurring Deposits"} ({deposits.length})</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
              <p style={{ color: "#64748b", marginTop: "1rem" }}>Loading...</p>
            </div>
          ) : deposits.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <p>No {activeTab === "fd" ? "Fixed" : "Recurring"} Deposits found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Customer</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Scheme</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Account</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Tenure</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Interest</th>
                    <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Maturity</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Maturity Date</th>
                    <th style={{ padding: "1rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                {deposits.map((deposit) => {
                  const statusInfo = getStatusLabel(deposit.status);
                  return (
                    <tr key={deposit._id} style={{ borderBottom: "1px solid #e2e8f0", background: deposit.status === "customer_deleted" ? "#fef2f2" : "transparent" }}>
                      <td style={{ padding: "1rem" }}>
                        {deposit.user ? (
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{deposit.user.firstName} {deposit.user.lastName}</span>
                        ) : (
                          <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ Customer Deleted</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem", color: "#64748b" }}>{deposit.schemeName || "-"}</td>
                      <td style={{ padding: "1rem", fontFamily: "monospace", color: "#64748b" }}>{deposit.account?.accountNumber?.slice(-4) || "-"}</td>
                      <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{formatCurrency(deposit.amount || deposit.monthlyAmount)}</td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "#64748b" }}>{deposit.tenure || deposit.tenureMonths} mo</td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "#3b82f6", fontWeight: 500 }}>{deposit.interestRate}%</td>
                      <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "#059669" }}>{formatCurrency(deposit.maturityAmount)}</td>
                      <td style={{ padding: "1rem", color: "#64748b" }}>{deposit.maturityDate ? new Date(deposit.maturityDate).toLocaleDateString() : "-"}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <span style={{ 
                          display: "inline-block", 
                          padding: "0.25rem 0.75rem", 
                          borderRadius: 20, 
                          fontSize: "0.75rem", 
                          fontWeight: 600,
                          color: statusInfo.color,
                          background: statusInfo.bg
                        }}>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showSchemeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setShowSchemeModal(false)}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 600, width: "100%", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{editingScheme ? "Edit Scheme" : "Create New Scheme"}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>Configure deposit scheme details</div>
              </div>
              <button onClick={() => setShowSchemeModal(false)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSaveScheme}>
              <div style={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Scheme Name *</label>
                    <input 
                      type="text" 
                      value={schemeForm.name} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Type *</label>
                    <select 
                      value={schemeForm.type} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, type: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", background: "white" }}
                    >
                      <option value="fixed">Fixed Deposit</option>
                      <option value="recurring">Recurring Deposit</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Description</label>
                    <textarea 
                      value={schemeForm.description} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })} 
                      rows={2}
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", resize: "vertical" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Minimum Amount (₹) *</label>
                    <input 
                      type="number" 
                      value={schemeForm.minAmount} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, minAmount: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Maximum Amount (₹)</label>
                    <input 
                      type="number" 
                      value={schemeForm.maxAmount} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, maxAmount: e.target.value })} 
                      placeholder="Leave empty for no limit"
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Minimum Tenure (months) *</label>
                    <input 
                      type="number" 
                      value={schemeForm.minTenureMonths} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, minTenureMonths: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Maximum Tenure (months) *</label>
                    <input 
                      type="number" 
                      value={schemeForm.maxTenureMonths} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, maxTenureMonths: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Interest Rate (% p.a.) *</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={schemeForm.interestRate} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, interestRate: e.target.value })} 
                      required
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Senior Citizen Rate (% p.a.)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={schemeForm.seniorCitizenRate} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, seniorCitizenRate: e.target.value })} 
                      placeholder="Optional"
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Special Rate (% p.a.)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={schemeForm.specialRate} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, specialRate: e.target.value })} 
                      placeholder="For higher amounts"
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Special Rate Min Amount (₹)</label>
                    <input 
                      type="number" 
                      value={schemeForm.specialRateMinAmount} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, specialRateMinAmount: e.target.value })} 
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Status</label>
                    <select 
                      value={schemeForm.isActive} 
                      onChange={(e) => setSchemeForm({ ...schemeForm, isActive: e.target.value === "true" })}
                      style={{ width: "100%", padding: "0.75rem", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: "1rem", background: "white" }}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button 
                  type="button" 
                  onClick={() => setShowSchemeModal(false)}
                  style={{ padding: "0.75rem 1.5rem", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
                >
                  {editingScheme ? "Update" : "Create"} Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposits;