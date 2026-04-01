import React, { useState, useEffect } from "react";
import { admin, kyc } from "../../services/api";

const KYCVerification = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => { loadKYC(); }, [statusFilter]);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await admin.getKYC(params);
      setKycList(res.data.kycRecords || []);
    } catch (error) {
      setKycList([]);
    } finally { setLoading(false); }
  };

  const handleReview = async (status) => {
    try {
      await admin.reviewKYC(selectedKYC._id, { status, remark });
      loadKYC();
      setSelectedKYC(null);
      setRemark("");
    } catch (error) {
      setKycList(kycList.map(k => k._id === selectedKYC._id ? { ...k, status } : k));
      setSelectedKYC(null);
      setRemark("");
    }
  };

  const getStatusBadge = (status) => ({ verified: "badge-success", pending: "badge-warning", rejected: "badge-danger" }[status] || "badge-default");
  const docLabels = { aadhar: "Aadhaar Card", pan: "PAN Card", passport: "Passport", voterId: "Voter ID", drivingLicense: "Driving License" };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">KYC Verification</h1>
        <p className="page-subtitle">Verify customer identity documents</p>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><h3>{kycList.filter(k => k.status === "pending").length}</h3><p>Pending</p></div></div>
        <div className="admin-stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{kycList.filter(k => k.status === "verified").length}</h3><p>Verified</p></div></div>
        <div className="admin-stat-card"><div className="stat-icon red">❌</div><div className="stat-info"><h3>{kycList.filter(k => k.status === "rejected").length}</h3><p>Rejected</p></div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">KYC Applications</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Email</th><th>Verification Level</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {kycList.map((kyc) => (
                <tr key={kyc._id}>
                  <td style={{ fontWeight: 600 }}>{kyc.user?.firstName} {kyc.user?.lastName}</td>
                  <td>{kyc.user?.email}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: 100, height: 8, background: "#e2e8f0", borderRadius: 4 }}>
                        <div style={{ width: `${(kyc.verificationLevel / 5) * 100}%`, height: "100%", background: kyc.verificationLevel === 5 ? "#22c55e" : "#f59e0b", borderRadius: 4 }}></div>
                      </div>
                      <span>{kyc.verificationLevel}/5</span>
                    </div>
                  </td>
                  <td>{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                  <td><span className={`admin-badge ${getStatusBadge(kyc.status)}`}>{kyc.status}</span></td>
                  <td><button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setSelectedKYC(kyc)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedKYC && (
        <div className="admin-modal-overlay" onClick={() => setSelectedKYC(null)}>
          <div className="admin-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3 className="admin-modal-title">KYC Review - {selectedKYC.user?.firstName} {selectedKYC.user?.lastName}</h3><button className="admin-modal-close" onClick={() => setSelectedKYC(null)}>×</button></div>
            <div className="admin-modal-body">
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "1rem" }}>Documents</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {Object.entries(selectedKYC.documents || {}).map(([key, doc]) => (
                    <div key={key} style={{ padding: "1rem", background: "#f8fafc", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{docLabels[key]}</span>
                      <span className={`admin-badge ${doc.verified ? "badge-success" : "badge-default"}`}>{doc.verified ? "Verified" : "Not Verified"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-form-group">
                <label>Remark / Reason</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Enter remark for approval/rejection..." rows={3}></textarea>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedKYC.status === "pending" && (
                <>
                  <button className="admin-btn admin-btn-danger" onClick={() => handleReview("rejected")}>Reject</button>
                  <button className="admin-btn admin-btn-primary" onClick={() => handleReview("verified")}>Approve</button>
                </>
              )}
              {selectedKYC.status !== "pending" && <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedKYC(null)}>Close</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification;
