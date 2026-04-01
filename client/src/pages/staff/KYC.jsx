import React, { useState, useEffect } from "react";
import { staff as staffApi } from "../../services/api";

const StaffKYC = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => { loadKYC(); }, [statusFilter]);

  const loadKYC = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await staffApi.getPendingKYC(params);
      setKycList(data || []);
    } catch (error) {
      setKycList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!remark && status === "rejected") {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      await staffApi.reviewKYC(selectedKYC._id, { status, remark });
      alert(`KYC ${status} successfully!`);
      setSelectedKYC(null);
      setRemark("");
      loadKYC();
    } catch (error) {
      alert("Failed to review KYC");
    }
  };

  const getStatusBadge = (status) => ({ verified: "badge-success", pending: "badge-warning", rejected: "badge-danger" }[status] || "badge-default");
  const docLabels = { aadhar: "Aadhaar Card", pan: "PAN Card", passport: "Passport", voterId: "Voter ID", drivingLicense: "Driving License" };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>KYC Verification</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Review and verify customer documents</p>
      </div>

      <div className="staff-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="staff-stat-card"><div className="staff-stat-icon yellow">⏳</div><div className="staff-stat-info"><h3>{kycList.filter(k => k.status === "pending").length}</h3><p>Pending</p></div></div>
        <div className="staff-stat-card"><div className="staff-stat-icon green">✅</div><div className="staff-stat-info"><h3>{kycList.filter(k => k.status === "verified").length}</h3><p>Verified</p></div></div>
        <div className="staff-stat-card"><div className="staff-stat-icon red">❌</div><div className="staff-stat-info"><h3>{kycList.filter(k => k.status === "rejected").length}</h3><p>Rejected</p></div></div>
      </div>

      <div className="staff-card">
        <div className="staff-card-header">
          <h3 className="staff-card-title">KYC Applications</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="staff-loading"><div className="staff-spinner"></div></div>
        ) : (
          <table className="staff-table">
            <thead><tr><th>Customer</th><th>Email</th><th>Verification Level</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {kycList.map((kyc) => (
                <tr key={kyc._id}>
                  <td style={{ fontWeight: 600 }}>{kyc.user?.firstName} {kyc.user?.lastName}</td>
                  <td>{kyc.user?.email}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 100, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                        <div style={{ width: `${(kyc.verificationLevel / 5) * 100}%`, height: '100%', background: kyc.verificationLevel === 5 ? '#22c55e' : '#f59e0b', borderRadius: 4 }}></div>
                      </div>
                      <span>{kyc.verificationLevel}/5</span>
                    </div>
                  </td>
                  <td>{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                  <td><span className={`staff-badge ${getStatusBadge(kyc.status)}`}>{kyc.status}</span></td>
                  <td><button className="staff-btn staff-btn-primary staff-btn-sm" onClick={() => setSelectedKYC(kyc)}>Review</button></td>
                </tr>
              ))}
              {kycList.length === 0 && (
                <tr><td colSpan="6" className="staff-empty">No KYC applications found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedKYC && (
        <div className="staff-modal-overlay" onClick={() => setSelectedKYC(null)}>
          <div className="staff-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3 className="staff-modal-title">KYC Review - {selectedKYC.user?.firstName} {selectedKYC.user?.lastName}</h3>
              <button className="staff-modal-close" onClick={() => setSelectedKYC(null)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Documents</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {Object.entries(selectedKYC.documents || {}).map(([key, doc]) => (
                    <div key={key} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{docLabels[key]}</span>
                      <span className={`staff-badge ${doc.verified ? 'badge-success' : 'badge-default'}`}>{doc.verified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="staff-form-group">
                <label>Remark / Reason</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Enter remark for approval/rejection..." rows={3}></textarea>
              </div>
            </div>
            <div className="staff-modal-footer">
              {selectedKYC.status === "pending" && (
                <>
                  <button className="staff-btn staff-btn-danger" onClick={() => handleReview("rejected")}>Reject</button>
                  <button className="staff-btn staff-btn-primary" onClick={() => handleReview("verified")}>Approve</button>
                </>
              )}
              {selectedKYC.status !== "pending" && <button className="staff-btn staff-btn-secondary" onClick={() => setSelectedKYC(null)}>Close</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffKYC;
