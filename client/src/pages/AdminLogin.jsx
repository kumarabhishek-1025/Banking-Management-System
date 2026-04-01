import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employees, auth } from "../services/api";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotData, setForgotData] = useState({ email: "", otp: "", newPassword: "" });
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Debug check on load
    checkUserInDB();
  }, []);

  const checkUserInDB = async () => {
    try {
      const email = "kabhishek76683@gmail.com";
      const response = await axios.get(`${API_URL}/employees/debug-lookup?email=${encodeURIComponent(email)}`);
      console.log("Debug lookup:", response.data);
      setDebugInfo(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error("Debug lookup failed:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await employees.login(formData);
      
      const user = data.admin || data.employee;
      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        setError("Access denied. Admin only.");
        setLoading(false);
        return;
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const { data } = await employees.forgotPassword({ email: forgotData.email });
      setForgotStep(2);
      setForgotSuccess(data.message || "OTP sent to your email");
      if (data.otp) {
        setForgotSuccess(`${data.message} (OTP: ${data.otp} for testing)`);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      await employees.resetPassword({
        email: forgotData.email,
        otp: forgotData.otp,
        newPassword: forgotData.newPassword
      });
      setForgotSuccess("Password reset successful! Please login.");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotData({ email: "", otp: "", newPassword: "" });
        setForgotSuccess("");
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="animated-bg">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <div className="auth-brand">
            <div className="auth-logo" style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a5a)" }}>H</div>
            <span className="auth-brand-name">Horizon</span>
          </div>

          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">Secure admin access only</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in..." : "Admin Login"}
            </button>
          </form>

          <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
              <Link to="/sign-in" style={{ color: "#667eea", textDecoration: "none", marginRight: "1rem" }}>Customer Login</Link>
              <Link to="/staff-login" style={{ color: "#667eea", textDecoration: "none" }}>Staff Login</Link>
            </div>
            <Link to="/" style={{ color: "#667eea", textDecoration: "none" }}>← Back to Home</Link>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button 
              type="button" 
              className="btn-link" 
              onClick={() => setShowForgot(true)}
              style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", textDecoration: "underline" }}
            >
              Forgot Password?
            </button>
          </div>

          {debugInfo && (
            <div style={{ marginTop: "1rem", padding: "10px", background: "#f0f0f0", fontSize: "12px", fontFamily: "monospace" }}>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>

        {showForgot && (
          <div className="auth-card" style={{ maxWidth: 420, marginTop: 20 }}>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {forgotStep === 1 ? "Enter your email to receive OTP" : "Enter OTP and new password"}
            </p>
            
            <form className="auth-form" onSubmit={forgotStep === 1 ? handleSendOTP : handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={forgotData.email}
                  onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                  required
                  disabled={forgotStep === 2}
                />
              </div>

              {forgotStep === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">OTP</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter OTP"
                      value={forgotData.otp}
                      onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password"
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {forgotError && <div className="auth-error">{forgotError}</div>}
              {forgotSuccess && <div className="auth-success" style={{ color: "green", padding: "10px", textAlign: "center" }}>{forgotSuccess}</div>}

              <button type="submit" className="btn btn-primary btn-block" disabled={forgotLoading}>
                {forgotLoading ? "Processing..." : forgotStep === 1 ? "Send OTP" : "Reset Password"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button 
                type="button" 
                onClick={() => { setShowForgot(false); setForgotStep(1); setForgotData({ email: "", otp: "", newPassword: "" }); setForgotError(""); }}
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
