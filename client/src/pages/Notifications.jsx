import React, { useState, useEffect } from "react";
import { notifications as notificationsApi } from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const params = filter !== "all" ? { isRead: filter === "unread" ? "false" : "true" } : {};
      const { data } = await notificationsApi.getAll(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(id);
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getIcon = (type) => {
    const icons = {
      transaction: "💰",
      alert: "⚠️",
      security: "🔒",
      promotion: "🎁",
      reminder: "⏰",
      system: "📢"
    };
    return icons[type] || "📌";
  };

  const getPriorityClass = (priority) => {
    const classes = {
      urgent: "badge-danger",
      high: "badge-warning",
      medium: "badge-primary",
      low: "badge-secondary"
    };
    return classes[priority] || "badge-secondary";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your account activity</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {unreadCount > 0 && (
            <span style={{ background: "var(--danger)", color: "white", padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.85rem" }}>
              {unreadCount} unread
            </span>
          )}
          <button className="btn btn-secondary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark All Read
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "1px solid var(--gray-200)", paddingBottom: "1rem" }}>
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3 className="empty-title">No Notifications</h3>
            <p className="empty-text">You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem",
                  background: notification.isRead ? "white" : "var(--gray-50)",
                  borderRadius: 12,
                  border: notification.isRead ? "1px solid var(--gray-200)" : "2px solid var(--primary)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => !notification.isRead && handleMarkRead(notification._id)}
              >
                <div style={{ fontSize: "1.5rem" }}>{getIcon(notification.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>{notification.title}</h4>
                    <span className={`badge ${getPriorityClass(notification.priority)}`}>{notification.priority}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{notification.message}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(notification.createdAt)}</span>
                    <button
                      className="btn"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {!notification.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", alignSelf: "center" }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
