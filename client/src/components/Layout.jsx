import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { notifications as notificationsApi } from "../services/api";

const Layout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationsApi.getAll({ read: false });
      const unread = data.notifications?.filter(n => !n.isRead).length || 0;
      setNotificationCount(unread);
    } catch (error) {
      console.error("Failed to load notifications");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getInitials = (name) => {
    return name ? `${name.firstName?.[0] || ""}${name.lastName?.[0] || ""}`.toUpperCase() : "U";
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/dashboard/accounts", label: "Accounts", icon: "💳" },
    { path: "/dashboard/transfer", label: "Transfer", icon: "📤" },
    { path: "/dashboard/transactions", label: "Transactions", icon: "📋" },
    { path: "/dashboard/payments", label: "Payments", icon: "💵" },
  ];

  const moreItems = [
    { path: "/dashboard/fixed-deposits", label: "Fixed Deposits", icon: "📊" },
    { path: "/dashboard/recurring-deposits", label: "Recurring Deposits", icon: "📈" },
    { path: "/dashboard/loans", label: "Loans", icon: "🏠" },
    { path: "/dashboard/credit-cards", label: "Credit Cards", icon: "💳" },
    { path: "/dashboard/cheque-books", label: "Cheque Books", icon: "📝" },
    { path: "/dashboard/statements", label: "Statements", icon: "📄" },
  ];

  return (
    <div className="dashboard">
      <div className="animated-bg">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="bg-orb bg-orb-4"></div>
        <div className="bg-grid"></div>
      </div>

      <header className="dashboard-header">
        <div className="header-left">
          <div className="auth-brand">
            <div className="auth-logo">H</div>
            <span className="auth-brand-name">Horizon</span>
          </div>
        </div>

        <nav className="dashboard-nav" style={{ gap: "0.25rem" }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              end={item.path === "/"}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div 
            className="nav-link" 
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>⚙️</span>
            <span>More</span>
            <span style={{ fontSize: "0.7rem" }}>▼</span>
            
            {showDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.5rem",
                background: "var(--white)",
                borderRadius: 12,
                boxShadow: "var(--shadow-lg)",
                minWidth: 200,
                zIndex: 100,
                overflow: "hidden",
                animation: "dropdownFade 0.2s ease-out"
              }}>
                {moreItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem 1rem",
                      color: "var(--text)",
                      transition: "all 0.2s"
                    }}
                    className={({ isActive }) => isActive ? "active" : ""}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="header-right">
          <NavLink to="/dashboard/notifications" className="notification-bell" style={{ textDecoration: "none", color: "inherit" }}>
            🔔
            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          </NavLink>
          <NavLink to="/dashboard/profile" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="user-menu">
              <div className="user-avatar">{getInitials(user)}</div>
              <span className="user-name">{user.firstName || "User"}</span>
            </div>
          </NavLink>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <Outlet />
      </main>

      <style>{`
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-link.active {
          background: var(--gradient-primary) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }
        
        .dashboard-nav .nav-link:not(.active):hover {
          background: var(--white) !important;
          color: var(--text) !important;
        }
      `}</style>
    </div>
  );
};

export default Layout;
