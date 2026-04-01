import React, { useState } from "react";
import { Link, Outlet, useNavigate, NavLink } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  const getInitials = (name) => {
    return name ? `${name.firstName?.[0] || ""}${name.lastName?.[0] || ""}`.toUpperCase() : "A";
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "🏠", exact: true },
    { path: "/admin/customers", label: "Customers", icon: "👥" },
    { path: "/admin/accounts", label: "Accounts", icon: "💳" },
    { path: "/admin/transactions", label: "Transactions", icon: "📋" },
    { path: "/admin/loans", label: "Loans", icon: "🏠" },
  ];

  const moreItems = [
    { path: "/admin/deposits", label: "Deposits", icon: "📊" },
    { path: "/admin/staff", label: "Staff", icon: "👨‍💼" },
    { path: "/admin/admins", label: "Admins", icon: "👑" },
    { path: "/admin/kyc", label: "KYC Verification", icon: "📄" },
    { path: "/admin/credit-cards", label: "Credit Cards", icon: "💳" },
    { path: "/admin/cheque-books", label: "Cheque Books", icon: "📝" },
    { path: "/admin/security", label: "Security", icon: "🔒" },
    { path: "/admin/reports", label: "Reports", icon: "📑" },
    { path: "/admin/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin/interest", label: "Interest & Charges", icon: "📈" },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: "📜" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
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
            <span className="auth-brand-name">Horizon <span style={{ opacity: 0.6, fontWeight: 400 }}>Admin</span></span>
          </div>
        </div>

        <nav className="dashboard-nav" style={{ gap: "0.25rem" }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              end={item.exact}
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
                minWidth: 220,
                zIndex: 100,
                overflow: "hidden",
                animation: "dropdownFade 0.2s ease-out"
              }}>
                {moreItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path}
                    end={item.path === "/admin"}
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
          <NavLink to="/admin/notifications" className="notification-bell" style={{ textDecoration: "none", color: "inherit" }}>
            🔔
            <span className="notification-badge">3</span>
          </NavLink>
          <NavLink to="/admin/settings" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="user-menu">
              <div className="user-avatar">{getInitials(user)}</div>
              <span className="user-name">{user.firstName || "Admin"}</span>
            </div>
          </NavLink>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <Outlet />

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

          /* Admin card styles matching user UI */
          .admin-card {
            background: var(--white);
            border-radius: 20px;
            padding: 1.75rem;
            box-shadow: var(--shadow);
            margin-bottom: 1.5rem;
            transition: all 0.3s;
          }

          .admin-card:hover {
            box-shadow: var(--shadow-lg);
          }

          .admin-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .admin-card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--dark);
            margin: 0;
          }

          .admin-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .admin-stat-card {
            background: var(--white);
            border-radius: 20px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: var(--shadow);
            transition: all 0.3s;
          }

          .admin-stat-card:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
          }

          .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
          }

          .stat-icon.blue { background: rgba(37, 99, 235, 0.1); }
          .stat-icon.green { background: rgba(16, 185, 129, 0.1); }
          .stat-icon.yellow { background: rgba(245, 158, 11, 0.1); }
          .stat-icon.red { background: rgba(239, 68, 68, 0.1); }
          .stat-icon.purple { background: rgba(139, 92, 246, 0.1); }
          .stat-icon.orange { background: rgba(249, 115, 22, 0.1); }

          .stat-info h3 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
            word-break: break-word;
            line-height: 1.2;
          }

          .stat-info p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.875rem;
          }

          .admin-table {
            width: 100%;
            border-collapse: collapse;
          }

          .admin-table th,
          .admin-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
          }

          .admin-table th {
            background: var(--gray-50);
            font-weight: 600;
            color: var(--text-muted);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .admin-table tr:hover {
            background: var(--gray-50);
          }

          .admin-badge {
            display: inline-flex;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .badge-success { background: rgba(16, 185, 129, 0.1); color: #059669; }
          .badge-warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
          .badge-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
          .badge-info { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
          .badge-default { background: var(--gray-100); color: var(--text-muted); }

          .admin-btn {
            padding: 0.625rem 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
          }

          .admin-btn-primary {
            background: var(--gradient-primary);
            color: white;
          }

          .admin-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          }

          .admin-btn-secondary {
            background: var(--gray-100);
            color: var(--text);
          }

          .admin-btn-secondary:hover {
            background: var(--gray-200);
          }

          .admin-btn-danger {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
          }

          .admin-btn-danger:hover {
            background: rgba(239, 68, 68, 0.2);
          }

          .admin-btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }

          .admin-search {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .admin-search input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 12px;
            font-size: 0.875rem;
            background: var(--white);
          }

          .admin-search input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .admin-form-group {
            margin-bottom: 1rem;
          }

          .admin-form-group label {
            display: block;
            font-weight: 600;
            color: var(--text);
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .admin-form-group input,
          .admin-form-group select,
          .admin-form-group textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 12px;
            font-size: 0.875rem;
            background: var(--white);
          }

          .admin-form-group input:focus,
          .admin-form-group select:focus,
          .admin-form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .admin-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 3rem;
          }

          .admin-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-200);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .admin-empty {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
          }

          .admin-empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .admin-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border);
          }

          .admin-tab {
            padding: 0.75rem 1.5rem;
            background: none;
            border: none;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          }

          .admin-tab:hover {
            color: var(--text);
          }

          .admin-tab.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }

          .admin-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .admin-modal {
            background: var(--white);
            border-radius: 20px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .admin-modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .admin-modal-title {
            font-size: 1.25rem;
            font-weight: 700;
          }

          .admin-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-muted);
          }

          .admin-modal-body {
            padding: 1.5rem;
          }

          .admin-modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }

          .admin-pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
          }

          .admin-pagination-info {
            color: var(--text-muted);
            font-size: 0.875rem;
          }

          .admin-pagination-buttons {
            display: flex;
            gap: 0.5rem;
          }
        `}</style>
      </main>
    </div>
  );
};

export default AdminLayout;
