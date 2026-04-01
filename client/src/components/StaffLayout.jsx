import React, { useState } from "react";
import { Link, Outlet, useNavigate, NavLink } from "react-router-dom";

const StaffLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("staffMode");
    navigate("/staff-login");
  };

  const menuItems = [
    { path: "/staff", icon: "📊", label: "Dashboard", exact: true },
    { path: "/staff/customers", icon: "👥", label: "Customers" },
    { path: "/staff/operations", icon: "💰", label: "Operations" },
    { path: "/staff/transactions", icon: "💳", label: "Transactions" },
    { path: "/staff/kyc", icon: "📄", label: "KYC Verification" },
    { path: "/staff/complaints", icon: "📝", label: "Complaints" },
    { path: "/staff/profile", icon: "👤", label: "My Profile" },
  ];

  const getRoleColor = () => {
    const colors = { manager: "#22c55e", teller: "#3b82f6", auditor: "#8b5cf6", clerk: "#f59e0b", support: "#ec4899" };
    return colors[user.role] || "#6b7280";
  };

  return (
    <div className="staff-layout">
      <aside className={`staff-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="staff-sidebar-header">
          <div className="staff-logo" style={{ background: `linear-gradient(135deg, ${getRoleColor()}, #374151)` }}>H</div>
          {sidebarOpen && <span className="staff-brand">Horizon Staff</span>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="staff-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `staff-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="staff-sidebar-footer">
          <div style={{ padding: "0.75rem 1rem", marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Logged in as</div>
            <div style={{ fontWeight: 600, color: "white" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: "0.75rem", color: getRoleColor(), textTransform: "capitalize" }}>{user.role}</div>
          </div>
          <button className="staff-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="staff-main">
        <header className="staff-header">
          <div className="staff-header-left">
            <h1 className="staff-page-title">Staff Panel</h1>
          </div>
          <div className="staff-header-right">
            <div className="staff-user-info">
              <div className="staff-user-avatar" style={{ background: `linear-gradient(135deg, ${getRoleColor()}, #374151)` }}>
                {user.firstName?.[0] || "S"}
              </div>
              <div>
                <div className="staff-user-name">{user.firstName || "Staff"}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize" }}>{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="staff-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .staff-layout { display: flex; min-height: 100vh; background: #f8fafc; }
        .staff-sidebar { width: 260px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); color: white; display: flex; flex-direction: column; transition: width 0.3s ease; position: fixed; height: 100vh; z-index: 100; }
        .staff-sidebar.closed { width: 70px; }
        .staff-sidebar-header { padding: 1.25rem; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .staff-logo { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.25rem; flex-shrink: 0; }
        .staff-brand { font-weight: 700; font-size: 1.1rem; white-space: nowrap; }
        .sidebar-toggle { margin-left: auto; background: rgba(255,255,255,0.1); border: none; color: white; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .staff-nav { flex: 1; padding: 1rem 0.5rem; overflow-y: auto; }
        .staff-nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: rgba(255,255,255,0.7); text-decoration: none; border-radius: 8px; margin-bottom: 0.25rem; transition: all 0.2s; }
        .staff-nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .staff-nav-item.active { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
        .nav-icon { font-size: 1.25rem; width: 24px; text-align: center; }
        .nav-label { white-space: nowrap; }
        .staff-sidebar-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .staff-logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .staff-logout-btn:hover { background: rgba(239, 68, 68, 0.3); color: white; }
        .staff-main { flex: 1; margin-left: 260px; transition: margin-left 0.3s ease; }
        .staff-sidebar.closed + .staff-main { margin-left: 70px; }
        .staff-header { background: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 50; }
        .staff-page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
        .staff-user-info { display: flex; align-items: center; gap: 0.75rem; }
        .staff-user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .staff-user-name { font-weight: 600; color: #1e293b; }
        .staff-content { padding: 2rem; }
        
        .staff-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        .staff-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .staff-card-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .staff-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .staff-stat-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .staff-stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .staff-stat-icon.blue { background: #dbeafe; }
        .staff-stat-icon.green { background: #dcfce7; }
        .staff-stat-icon.yellow { background: #fef3c7; }
        .staff-stat-icon.red { background: #fee2e2; }
        .staff-stat-icon.purple { background: #f3e8ff; }
        .staff-stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .staff-stat-info p { margin: 0; color: #64748b; font-size: 0.875rem; }
        
        .staff-table { width: 100%; border-collapse: collapse; }
        .staff-table th, .staff-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .staff-table th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .staff-table tr:hover { background: #f8fafc; }
        
        .staff-btn { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; }
        .staff-btn-primary { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
        .staff-btn-primary:hover { opacity: 0.9; }
        .staff-btn-secondary { background: #f1f5f9; color: #475569; }
        .staff-btn-secondary:hover { background: #e2e8f0; }
        .staff-btn-danger { background: #fee2e2; color: #991b1b; }
        .staff-btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
        
        .staff-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-default { background: #f1f5f9; color: #475569; }
        
        .staff-search { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .staff-search input { flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; }
        .staff-search input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1); }
        .staff-search select { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; background: white; cursor: pointer; }
        
        .staff-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .staff-form-group { margin-bottom: 1rem; }
        .staff-form-group label { display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem; font-size: 0.875rem; }
        .staff-form-group input, .staff-form-group select, .staff-form-group textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; }
        .staff-form-group input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1); }
        
        .staff-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .staff-modal { background: white; border-radius: 16px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .staff-modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .staff-modal-title { font-size: 1.25rem; font-weight: 700; }
        .staff-modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
        .staff-modal-body { padding: 1.5rem; }
        .staff-modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        
        .staff-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .staff-tab { padding: 0.75rem 1.5rem; background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .staff-tab:hover { color: #1e293b; }
        .staff-tab.active { color: #f59e0b; border-bottom-color: #f59e0b; }
        
        .staff-empty { text-align: center; padding: 3rem; color: #64748b; }
        .staff-loading { display: flex; justify-content: center; align-items: center; padding: 3rem; }
        .staff-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #f59e0b; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .quick-action-btn { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem 1rem; background: white; border: 2px dashed #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .quick-action-btn:hover { border-color: #f59e0b; background: #fffbeb; }
        .quick-action-icon { font-size: 2rem; }
        .quick-action-label { font-weight: 600; color: #1e293b; }
      `}</style>
    </div>
  );
};

export default StaffLayout;
