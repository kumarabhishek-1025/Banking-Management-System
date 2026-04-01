import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/api";

const StaffProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    try {
      setLoading(true);
      await auth.changePassword({ currentPassword, newPassword });
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("staffMode");
      navigate("/staff-login");
    }
  };

  const getRoleBadge = (role) => {
    const badges = { manager: "badge-success", teller: "badge-info", auditor: "badge-warning", clerk: "badge-warning", support: "badge-default" };
    return badges[role] || "badge-default";
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>My Profile</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Manage your account settings</p>
      </div>

      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Profile</button>
        <button className={`staff-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>🔒 Change Password</button>
      </div>

      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="staff-card">
            <h3 className="staff-card-title" style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 700 }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                <span className={`staff-badge ${getRoleBadge(user.role)}`} style={{ textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
            <div className="staff-form-grid">
              <div className="staff-form-group">
                <label>First Name</label>
                <input type="text" value={user.firstName || ''} disabled />
              </div>
              <div className="staff-form-group">
                <label>Last Name</label>
                <input type="text" value={user.lastName || ''} disabled />
              </div>
              <div className="staff-form-group">
                <label>Email</label>
                <input type="email" value={user.email || ''} disabled />
              </div>
              <div className="staff-form-group">
                <label>Phone</label>
                <input type="text" value={user.phone || 'Not set'} disabled />
              </div>
              <div className="staff-form-group">
                <label>Role</label>
                <input type="text" value={user.role || 'Staff'} disabled style={{ textTransform: 'capitalize' }} />
              </div>
              <div className="staff-form-group">
                <label>Employee ID</label>
                <input type="text" value={user.employeeId || 'N/A'} disabled />
              </div>
            </div>
          </div>

          <div className="staff-card">
            <h3 className="staff-card-title" style={{ marginBottom: '1.5rem' }}>Account Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 12 }}>
                <h4 style={{ margin: '0 0 0.5rem' }}>Logout</h4>
                <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.875rem' }}>Sign out from your account</p>
                <button className="staff-btn staff-btn-danger" onClick={handleLogout}>🚪 Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="staff-card" style={{ maxWidth: 500 }}>
          <h3 className="staff-card-title" style={{ marginBottom: '1.5rem' }}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="staff-form-group">
              <label>Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="staff-form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="staff-form-group">
              <label>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="staff-btn staff-btn-primary" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;
