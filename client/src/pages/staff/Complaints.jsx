import React, { useState, useEffect } from "react";
import { staff as staffApi } from "../../services/api";

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => { loadComplaints(); }, [statusFilter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await staffApi.getComplaints(params);
      setComplaints(data || []);
    } catch (error) {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!response) return alert("Please enter a response");
    try {
      await staffApi.respondToComplaint(selectedComplaint._id, { response });
      alert("Response sent successfully!");
      setSelectedComplaint(null);
      setResponse("");
      loadComplaints();
    } catch (error) {
      alert("Failed to send response");
    }
  };

  const handleResolve = async (complaintId) => {
    try {
      await staffApi.resolveComplaint(complaintId);
      alert("Complaint marked as resolved!");
      loadComplaints();
    } catch (error) {
      alert("Failed to resolve complaint");
    }
  };

  const getStatusBadge = (status) => ({ pending: "badge-warning", in_progress: "badge-info", resolved: "badge-success", closed: "badge-default" }[status] || "badge-default");
  const getPriorityBadge = (priority) => ({ high: "badge-danger", medium: "badge-warning", low: "badge-default" }[priority] || "badge-default");

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Complaint Handling</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>View and respond to customer complaints</p>
      </div>

      <div className="staff-stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="staff-stat-card"><div className="staff-stat-icon yellow">⏳</div><div className="staff-stat-info"><h3>{complaints.filter(c => c.status === "pending").length}</h3><p>Pending</p></div></div>
        <div className="staff-stat-card"><div className="staff-stat-icon blue">🔄</div><div className="staff-stat-info"><h3>{complaints.filter(c => c.status === "in_progress").length}</h3><p>In Progress</p></div></div>
        <div className="staff-stat-card"><div className="staff-stat-icon green">✅</div><div className="staff-stat-info"><h3>{complaints.filter(c => c.status === "resolved").length}</h3><p>Resolved</p></div></div>
      </div>

      <div className="staff-card">
        <div className="staff-card-header">
          <h3 className="staff-card-title">Customer Complaints</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="staff-loading"><div className="staff-spinner"></div></div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ fontWeight: 600 }}>{complaint.user?.firstName} {complaint.user?.lastName}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{complaint.subject}</td>
                  <td style={{ textTransform: 'capitalize' }}>{complaint.category}</td>
                  <td><span className={`staff-badge ${getPriorityBadge(complaint.priority)}`}>{complaint.priority}</span></td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td><span className={`staff-badge ${getStatusBadge(complaint.status)}`}>{complaint.status}</span></td>
                  <td>
                    <div className="staff-btn-group">
                      <button className="staff-btn staff-btn-secondary staff-btn-sm" onClick={() => setSelectedComplaint(complaint)}>View</button>
                      {complaint.status !== "resolved" && (
                        <button className="staff-btn staff-btn-primary staff-btn-sm" onClick={() => handleResolve(complaint._id)}>Resolve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="7" className="staff-empty">No complaints found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedComplaint && (
        <div className="staff-modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="staff-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3 className="staff-modal-title">Complaint Details</h3>
              <button className="staff-modal-close" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Customer:</span><span style={{ fontWeight: 600 }}>{selectedComplaint.user?.firstName} {selectedComplaint.user?.lastName}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Category:</span><span style={{ textTransform: 'capitalize' }}>{selectedComplaint.category}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Priority:</span><span className={`staff-badge ${getPriorityBadge(selectedComplaint.priority)}`}>{selectedComplaint.priority}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Date:</span><span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span></div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Subject:</div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>{selectedComplaint.subject}</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Description:</div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{selectedComplaint.description}</div>
              </div>
              {selectedComplaint.response && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Previous Response:</div>
                  <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{selectedComplaint.response}</div>
                </div>
              )}
              <div className="staff-form-group">
                <label>Respond to Complaint</label>
                <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type your response..." rows={4}></textarea>
              </div>
            </div>
            <div className="staff-modal-footer">
              <button className="staff-btn staff-btn-secondary" onClick={() => setSelectedComplaint(null)}>Close</button>
              <button className="staff-btn staff-btn-primary" onClick={handleRespond}>Send Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffComplaints;
