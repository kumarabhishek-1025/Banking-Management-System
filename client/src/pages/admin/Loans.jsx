import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [schemeForm, setSchemeForm] = useState({ name: "", type: "personal", interestRate: 10, minAmount: 10000, maxAmount: 5000000, minDuration: 1, maxDuration: 60, processingFee: 1 });

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "applications") {
        const res = await admin.getLoans({ page: pagination.page, limit: 10 });
        setLoans(res.data.loans || []);
        setPagination(prev => ({ ...prev, ...res.data.pagination }));
      } else {
        const res = await admin.getLoanSchemes();
        setSchemes(res.data || []);
      }
    } catch (error) {
      if (activeTab === "applications") {
        setLoans([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      } else {
        setSchemes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loan) => {
    try {
      await admin.reviewLoan(loan._id, { status: "approved" });
      loadData();
    } catch (error) {
      setLoans(loans.map(l => l._id === loan._id ? { ...l, status: "approved" } : l));
    }
  };

  const handleReject = async (loan) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await admin.reviewLoan(loan._id, { status: "rejected", reason });
      loadData();
    } catch (error) {
      setLoans(loans.map(l => l._id === loan._id ? { ...l, status: "rejected", reason } : l));
    }
  };

  const handleSchemeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScheme) {
        await admin.updateLoanScheme(editingScheme._id, schemeForm);
      } else {
        await admin.createLoanScheme(schemeForm);
      }
      setShowSchemeModal(false);
      loadData();
    } catch (error) {
      if (editingScheme) {
        setSchemes(schemes.map(s => s._id === editingScheme._id ? { ...s, ...schemeForm } : s));
      } else {
        setSchemes([...schemes, { _id: Date.now().toString(), ...schemeForm }]);
      }
      setShowSchemeModal(false);
    }
  };

  const handleDeleteScheme = async (scheme) => {
    if (!confirm("Delete this loan scheme?")) return;
    try {
      await admin.deleteLoanScheme(scheme._id);
      loadData();
    } catch (error) {
      setSchemes(schemes.filter(s => s._id !== scheme._id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = { pending: "badge-warning", approved: "badge-success", rejected: "badge-danger", disbursed: "badge-info" };
    return badges[status] || "badge-default";
  };

  const getTypeBadge = (type) => {
    const badges = { personal: "badge-info", home: "badge-success", car: "badge-warning", education: "badge-default", business: "badge-danger" };
    return badges[type] || "badge-default";
  };

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Loan Management</h1>
        <p className="page-subtitle">Manage loan applications and schemes</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "applications" ? "active" : ""}`} onClick={() => setActiveTab("applications")}>
          📋 Loan Applications ({loans.filter(l => l.status === "pending").length} pending)
        </button>
        <button className={`admin-tab ${activeTab === "schemes" ? "active" : ""}`} onClick={() => setActiveTab("schemes")}>
          ⚙️ Loan Schemes
        </button>
      </div>

      {activeTab === "applications" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Loan Applications</h3>
          </div>

          {loading ? (
            <div className="admin-loading"><div className="admin-spinner"></div></div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Tenure</th>
                    <th>Interest</th>
                    <th>EMI</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{loan.user?.firstName} {loan.user?.lastName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{loan.purpose}</div>
                      </td>
                      <td><span className={`admin-badge ${getTypeBadge(loan.type)}`}>{loan.type}</span></td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(loan.amount)}</td>
                      <td>{loan.tenure} months</td>
                      <td>{loan.interestRate}%</td>
                      <td>{formatCurrency(calculateEMI(loan.amount, loan.interestRate, loan.tenure))}</td>
                      <td>
                        <span className={`admin-badge ${getStatusBadge(loan.status)}`}>{loan.status}</span>
                        {loan.emiPaid && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{loan.emiPaid} EMI paid</div>}
                      </td>
                      <td>
                        <div className="admin-btn-group">
                          {loan.status === "pending" && (
                            <>
                              <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleApprove(loan)}>Approve</button>
                              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleReject(loan)}>Reject</button>
                            </>
                          )}
                          {loan.status === "rejected" && loan.reason && (
                            <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>{loan.reason}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {activeTab === "schemes" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Loan Schemes</h3>
            <button className="admin-btn admin-btn-primary" onClick={() => { setEditingScheme(null); setSchemeForm({ name: "", type: "personal", interestRate: 10, minAmount: 10000, maxAmount: 5000000, minDuration: 1, maxDuration: 60, processingFee: 1 }); setShowSchemeModal(true); }}>
              ➕ Add Scheme
            </button>
          </div>

          {loading ? (
            <div className="admin-loading"><div className="admin-spinner"></div></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Type</th>
                  <th>Interest Rate</th>
                  <th>Min Amount</th>
                  <th>Max Amount</th>
                  <th>Tenure</th>
                  <th>Processing Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme) => (
                  <tr key={scheme._id}>
                    <td style={{ fontWeight: 600 }}>{scheme.name}</td>
                    <td><span className={`admin-badge ${getTypeBadge(scheme.type)}`}>{scheme.type}</span></td>
                    <td>{scheme.interestRate}%</td>
                    <td>{formatCurrency(scheme.minAmount)}</td>
                    <td>{formatCurrency(scheme.maxAmount)}</td>
                    <td>{scheme.minDuration}-{scheme.maxDuration} months</td>
                    <td>{scheme.processingFee}%</td>
                    <td>
                      <div className="admin-btn-group">
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setEditingScheme(scheme); setSchemeForm(scheme); setShowSchemeModal(true); }}>Edit</button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteScheme(scheme)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showSchemeModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSchemeModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingScheme ? "Edit Scheme" : "Add New Scheme"}</h3>
              <button className="admin-modal-close" onClick={() => setShowSchemeModal(false)}>×</button>
            </div>
            <form onSubmit={handleSchemeSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Scheme Name *</label>
                    <input type="text" value={schemeForm.name} onChange={(e) => setSchemeForm({...schemeForm, name: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Loan Type *</label>
                    <select value={schemeForm.type} onChange={(e) => setSchemeForm({...schemeForm, type: e.target.value})}>
                      <option value="personal">Personal</option>
                      <option value="home">Home</option>
                      <option value="car">Car</option>
                      <option value="education">Education</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Interest Rate (%) *</label>
                    <input type="number" step="0.1" value={schemeForm.interestRate} onChange={(e) => setSchemeForm({...schemeForm, interestRate: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Min Amount (₹)</label>
                    <input type="number" value={schemeForm.minAmount} onChange={(e) => setSchemeForm({...schemeForm, minAmount: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Max Amount (₹)</label>
                    <input type="number" value={schemeForm.maxAmount} onChange={(e) => setSchemeForm({...schemeForm, maxAmount: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Min Tenure (months)</label>
                    <input type="number" value={schemeForm.minDuration} onChange={(e) => setSchemeForm({...schemeForm, minDuration: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Max Tenure (months)</label>
                    <input type="number" value={schemeForm.maxDuration} onChange={(e) => setSchemeForm({...schemeForm, maxDuration: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Processing Fee (%)</label>
                    <input type="number" step="0.1" value={schemeForm.processingFee} onChange={(e) => setSchemeForm({...schemeForm, processingFee: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowSchemeModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingScheme ? "Update" : "Create"} Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;
