import React, { useState, useEffect } from "react";
import { admin, auth as authApi } from "../../services/api";

const Security = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [ipInput, setIpInput] = useState("");

  useEffect(() => { loadSecurityData(); }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const logsRes = await admin.getLoginLogs();
      const ipRes = await admin.getBlockedIPs();
      setLoginLogs(logsRes.data || []);
      setBlockedIPs(ipRes.data || []);
    } catch (error) {
      setLoginLogs([]);
      setBlockedIPs([]);
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { alert("Passwords don't match"); return; }
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      alert("Password changed successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) { alert(error.response?.data?.message || "Failed to change password"); }
  };

  const handleBlockIP = async () => {
    if (!ipInput) return;
    try {
      await admin.blockIP(ipInput);
      setBlockedIPs([...blockedIPs, ipInput]);
      setIpInput("");
    } catch (error) { setBlockedIPs([...blockedIPs, ipInput]); }
  };

  const handleUnblockIP = async (ip) => {
    try {
      await admin.unblockIP(ip);
      setBlockedIPs(blockedIPs.filter(i => i !== ip));
    } catch (error) { setBlockedIPs(blockedIPs.filter(i => i !== ip)); }
  };

  const getStatusBadge = (status) => (status === "success" ? "badge-success" : "badge-danger");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Security & Access Control</h1>
        <p className="page-subtitle">Manage security settings</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>🔒 Change Password</button>
        <button className={`admin-tab ${activeTab === "2fa" ? "active" : ""}`} onClick={() => setActiveTab("2fa")}>🔐 Two-Factor Auth</button>
        <button className={`admin-tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>📋 Login Logs</button>
        <button className={`admin-tab ${activeTab === "ip" ? "active" : ""}`} onClick={() => setActiveTab("ip")}>🚫 Block IPs</button>
      </div>

      {activeTab === "password" && (
        <div className="admin-card" style={{ maxWidth: 500 }}>
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Change Admin Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="admin-form-group"><label>Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
            <div className="admin-form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
            <div className="admin-form-group"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
            <button type="submit" className="admin-btn admin-btn-primary">Change Password</button>
          </form>
        </div>
      )}

      {activeTab === "2fa" && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1rem" }}>Two-Factor Authentication (2FA)</h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Add an extra layer of security to your admin account by enabling 2FA.</p>
          
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12, marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 0.5rem" }}>Email-based 2FA</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Receive verification codes via email</p>
              </div>
              <label style={{ position: "relative", width: 50, height: 26 }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: "#22c55e", borderRadius: 26, transition: "0.3s" }}>
                  <span style={{ position: "absolute", content: "", height: 20, width: 20, left: 27, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }}></span>
                </span>
              </label>
            </div>
          </div>

          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12, marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 0.5rem" }}>SMS-based 2FA</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Receive verification codes via SMS</p>
              </div>
              <label style={{ position: "relative", width: 50, height: 26 }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: "#e2e8f0", borderRadius: 26, transition: "0.3s" }}>
                  <span style={{ position: "absolute", content: "", height: 20, width: 20, left: 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }}></span>
                </span>
              </label>
            </div>
          </div>

          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 0.5rem" }}>Authenticator App (TOTP)</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Use Google Authenticator or similar apps</p>
              </div>
              <button className="admin-btn admin-btn-secondary admin-btn-sm">Setup</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Login History</h3>
          {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
            <table className="admin-table">
              <thead><tr><th>User</th><th>IP Address</th><th>Location</th><th>Device</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {loginLogs.map((log) => (
                  <tr key={log._id}>
                    <td><div style={{ fontWeight: 600 }}>{log.user}</div><div style={{ fontSize: "0.75rem", color: "#64748b" }}>{log.email}</div></td>
                    <td style={{ fontFamily: "monospace" }}>{log.ip}</td>
                    <td>{log.location}</td>
                    <td>{log.device}</td>
                    <td>{log.time}</td>
                    <td><span className={`admin-badge ${getStatusBadge(log.status)}`}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "ip" && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Blocked IP Addresses</h3>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <input type="text" placeholder="Enter IP address to block" value={ipInput} onChange={(e) => setIpInput(e.target.value)} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <button className="admin-btn admin-btn-primary" onClick={handleBlockIP}>Block IP</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {blockedIPs.map((ip, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "#fee2e2", borderRadius: 8 }}>
                <span style={{ fontFamily: "monospace" }}>{ip}</span>
                <button onClick={() => handleUnblockIP(ip)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>×</button>
              </div>
            ))}
            {blockedIPs.length === 0 && <p style={{ color: "#64748b" }}>No blocked IPs</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
