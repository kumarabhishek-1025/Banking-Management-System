import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => { loadLogs(); }, [actionFilter, dateFrom, dateTo]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = { ...(actionFilter && { action: actionFilter }), ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) };
      const res = await admin.getAuditLogs(params);
      setLogs(res.data.logs || []);
    } catch (error) {
      setLogs([]);
    } finally { setLoading(false); }
  };

  const getActionBadge = (action) => {
    const badges = {
      USER_LOGIN: "badge-info", CREATE_ACCOUNT: "badge-success", APPROVE_LOAN: "badge-success",
      UPDATE_SETTINGS: "badge-warning", KYC_APPROVED: "badge-success", FREEZE_ACCOUNT: "badge-danger",
      REVERSE_TRANSACTION: "badge-danger", ADD_STAFF: "badge-info", DELETE: "badge-danger"
    };
    return badges[action] || "badge-default";
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Audit & Logs</h1>
        <p className="page-subtitle">Track all admin actions and system activities</p>
      </div>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-search" style={{ flexWrap: "wrap" }}>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="CREATE_ACCOUNT">Create Account</option>
            <option value="APPROVE_LOAN">Approve Loan</option>
            <option value="UPDATE_SETTINGS">Update Settings</option>
            <option value="KYC_APPROVED">KYC Approved</option>
            <option value="FREEZE_ACCOUNT">Freeze Account</option>
            <option value="REVERSE_TRANSACTION">Reverse Transaction</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Activity Log</h3>
        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Timestamp</th><th>Action</th><th>Admin</th><th>Details</th><th>IP Address</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td><div>{log.timestamp?.split(" ")[0]}</div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>{log.timestamp?.split(" ")[1]}</div></td>
                  <td><span className={`admin-badge ${getActionBadge(log.action)}`}>{log.action}</span></td>
                  <td style={{ fontWeight: 600 }}>{log.user}</td>
                  <td style={{ maxWidth: 300 }}>{log.details}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
