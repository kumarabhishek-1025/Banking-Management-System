import React, { useState, useEffect } from "react";
import { auth as authApi, kyc as kycApi } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    state: "",
    postalCode: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [userRes, kycRes] = await Promise.all([
        authApi.getMe(),
        kycApi.getStatus()
      ]);
      setUser(userRes.data);
      setKyc(kycRes.data);
      setFormData({
        firstName: userRes.data.firstName || "",
        lastName: userRes.data.lastName || "",
        address1: userRes.data.address1 || "",
        city: userRes.data.city || "",
        state: userRes.data.state || "",
        postalCode: userRes.data.postalCode || ""
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile(formData);
      alert("Profile updated successfully!");
      setEditing(false);
      loadProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleKYCSubmit = async () => {
    try {
      await kycApi.start();
      alert("KYC process started. Please complete your application.");
      loadProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start KYC");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getKYCStatusColor = (status) => {
    const colors = {
      verified: "var(--success)",
      pending: "var(--warning)",
      rejected: "var(--danger)",
      not_started: "var(--text-muted)"
    };
    return colors[status] || "var(--text-muted)";
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account information and preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Personal Information</h3>
            <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Save Changes
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Full Name</span>
                <span style={{ fontWeight: 500 }}>{user?.firstName} {user?.lastName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Email</span>
                <span>{user?.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Address</span>
                <span>{user?.address1 || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>City</span>
                <span>{user?.city || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>State</span>
                <span>{user?.state || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Postal Code</span>
                <span>{user?.postalCode || "-"}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <h3 className="card-title">KYC Verification</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: "50%", 
                background: getKYCStatusColor(kyc?.status),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "1.5rem", fontWeight: "bold"
              }}>
                {kyc?.verificationLevel || 0}/5
              </div>
              <div>
                <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{kyc?.status?.replace("_", " ") || "Not Started"}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {kyc?.isVerified ? "Your identity is verified" : "Complete KYC to unlock all features"}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              {["aadhar", "pan", "passport", "voterId", "drivingLicense"].map((doc, idx) => (
                <div key={doc} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <span style={{ textTransform: "capitalize" }}>{doc.replace(/([A-Z])/g, " $1").trim()} {idx === 0 ? "(ID)" : idx === 1 ? "(ID)" : ""}</span>
                  <span style={{ color: kyc?.documents?.[doc]?.verified ? "var(--success)" : "var(--text-muted)" }}>
                    {kyc?.documents?.[doc]?.verified ? "✓ Verified" : "— Not Verified"}
                  </span>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: "100%" }}
              onClick={handleKYCSubmit}
              disabled={kyc?.status === "verified"}
            >
              {kyc?.status === "not_started" ? "Start KYC" : kyc?.status === "verified" ? "KYC Completed" : "Continue KYC"}
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Security</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }} onClick={() => setShowPasswordModal(true)}>
                🔒 Change Password
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}>
                📱 Enable Two-Factor Authentication
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: "flex-start" }}>
                🔑 Manage Login Devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                {passwordError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{passwordError}</div>}
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
