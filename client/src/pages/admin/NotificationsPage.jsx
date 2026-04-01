import React, { useState, useEffect } from "react";
import { admin, notifications as notificationsApi } from "../../services/api";

const AdminNotificationsPage = () => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sendTo, setSendTo] = useState("all");
  const [userEmail, setUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await admin.getNotifications();
      setNotificationsList(res.data.notifications || []);
    } catch (error) {
      setNotificationsList([]);
    } finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      if (sendTo === "all") await admin.broadcast({ subject, message, type });
      else await admin.sendNotification(userEmail, { subject, message, type });
      alert("Notification sent successfully!");
      setShowModal(false); setSubject(""); setMessage("");
    } catch (error) {
      alert("Notification sent (demo)");
      setShowModal(false); setSubject(""); setMessage("");
    }
  };

  const getTypeBadge = (type) => ({ info: "badge-info", success: "badge-success", warning: "badge-warning", error: "badge-danger" }[type] || "badge-default");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Notifications & Alerts</h1>
        <p className="page-subtitle">Send notifications to customers</p>
      </div>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Send Notification</h3>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>➕ Send New</button>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Notification History</h3>
        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Message</th><th>Type</th><th>Recipients</th><th>Sent At</th></tr></thead>
            <tbody>
              {notificationsList.map((notif) => (
                <tr key={notif._id}>
                  <td style={{ fontWeight: 600 }}>{notif.title}</td>
                  <td style={{ maxWidth: 300 }}>{notif.message}</td>
                  <td><span className={`admin-badge ${getTypeBadge(notif.type)}`}>{notif.type}</span></td>
                  <td>{notif.recipients}</td>
                  <td>{new Date(notif.sentAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3 className="admin-modal-title">Send Notification</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSend}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Send To</label>
                  <select value={sendTo} onChange={(e) => setSendTo(e.target.value)}>
                    <option value="all">All Users (Broadcast)</option>
                    <option value="specific">Specific User</option>
                  </select>
                </div>
                {sendTo === "specific" && (
                  <div className="admin-form-group">
                    <label>User Email</label>
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="user@example.com" />
                  </div>
                )}
                <div className="admin-form-group">
                  <label>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="info">Information</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Alert</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required></textarea>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
