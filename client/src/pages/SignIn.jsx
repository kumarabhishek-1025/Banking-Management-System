import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "", demoOTP: "" });
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({ userId: "", email: "", otp: "" });
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showLoginOTP, setShowLoginOTP] = useState(false);
  const [loginOTPData, setLoginOTPData] = useState({ userId: "", email: "", otp: "" });
  const [loginOTPError, setLoginOTPError] = useState("");
  const [loginOTPLoading, setLoginOTPLoading] = useState(false);
  const [loginResendTimer, setLoginResendTimer] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await auth.login(formData);
      
      // If OTP verification needed (2FA) - for customers
      if (data.pendingOTP) {
        setLoginOTPData({ 
          userId: data.userId, 
          email: formData.email, 
          otp: data.otp || "" 
        });
        setShowLoginOTP(true);
      } else {
        // Admin logs in directly
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      const response = err.response?.data;
      if (response?.emailVerified === false) {
        setVerifyData({ userId: response.userId, email: formData.email, otp: "" });
        setShowVerifyModal(true);
      } else {
        setError(response?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOTPVerify = async (e) => {
    e.preventDefault();
    setLoginOTPError("");
    setLoginOTPLoading(true);

    try {
      const { data } = await auth.verifyLoginOTP({ 
        userId: loginOTPData.userId, 
        otp: loginOTPData.otp 
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setLoginOTPError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoginOTPLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setVerifyError("");
    setVerifyLoading(true);

    try {
      const { data } = await auth.verifyRegistrationOTP({ userId: verifyData.userId, otp: verifyData.otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setShowVerifyModal(false);
      navigate("/dashboard");
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerifyOTP = async () => {
    if (resendTimer > 0) return;
    setVerifyError("");
    setVerifyLoading(true);
    try {
      await auth.resendRegistrationOTP({ userId: verifyData.userId });
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const { data } = await auth.forgotPassword({ email: forgotData.email });
      // Store OTP if email failed (fallback)
      if (data.otp) {
        setForgotData({ ...forgotData, demoOTP: data.otp });
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      await auth.verifyOTP({ email: forgotData.email, otp: forgotData.otp });
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    if (forgotData.newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }
    setForgotLoading(true);
    try {
      await auth.resetPassword({ email: forgotData.email, otp: forgotData.otp, newPassword: forgotData.newPassword });
      alert("Password reset successfully! Please login with your new password.");
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
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
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">H</div>
            <span className="auth-brand-name">Horizon</span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Please enter your details to sign in</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#667eea", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1rem" }}>
              ← Back to Home
            </Link>
            <div style={{ marginBottom: "0.5rem" }}>
              <Link to="/admin-login" style={{ color: "#667eea", textDecoration: "none", marginRight: "1rem" }}>Admin Login</Link>
              <Link to="/staff-login" style={{ color: "#667eea", textDecoration: "none" }}>Staff Login</Link>
            </div>
            <button className="link-btn" onClick={() => setShowForgotModal(true)}>Forgot Password?</button>
            <br /><br />
            Don't have an account? <Link to="/sign-up">Create one</Link>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Your Email</h3>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                Your email is not verified. Please enter the OTP sent to <strong>{verifyData.email}</strong>
              </p>
              {verifyError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{verifyError}</div>}
              <form onSubmit={handleVerifyEmail}>
                <div className="form-group">
                  <label className="form-label">OTP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verifyData.otp}
                    onChange={(e) => setVerifyData({ ...verifyData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    style={{ textAlign: "center", letterSpacing: "4px" }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={verifyLoading}>
                  {verifyLoading ? "Verifying..." : "Verify Email"}
                </button>
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  {resendTimer > 0 ? (
                    <span style={{ color: "#666" }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerifyOTP}
                      style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="modal-overlay" onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "", demoOTP: "" }); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={() => setShowForgotModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {forgotStep === 1 && (
                <form onSubmit={handleSendOTP}>
                  <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>Enter your email to receive an OTP</p>
                  {forgotError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{forgotError}</div>}
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={forgotData.email}
                      onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              )}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP}>
                  <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>Enter the OTP sent to your email</p>
                  {forgotData.demoOTP && (
                    <div style={{ background: "var(--gray-100)", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", textAlign: "center" }}>
                      <small style={{ color: "var(--text-muted)" }}>Demo OTP:</small>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>{forgotData.demoOTP}</div>
                    </div>
                  )}
                  {forgotError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{forgotError}</div>}
                  <div className="form-group">
                    <label className="form-label">OTP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={forgotData.otp}
                      onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value })}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={forgotLoading}>
                    {forgotLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: "0.5rem" }} onClick={() => setForgotStep(1)}>
                    Back
                  </button>
                </form>
              )}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>Set your new password</p>
                  {forgotError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{forgotError}</div>}
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={forgotLoading}>
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginOTP && (
        <div className="modal-overlay" onClick={() => setShowLoginOTP(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Verify Login</h3>
              <button className="modal-close" onClick={() => setShowLoginOTP(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                Enter the OTP sent to <strong>{loginOTPData.email}</strong>
              </p>
              {loginOTPData.otp && (
                <div style={{ background: "#e8f5e9", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center" }}>
                  <small style={{ color: "#2e7d32" }}>Demo OTP:</small>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1b5e20" }}>{loginOTPData.otp}</div>
                </div>
              )}
              {loginOTPError && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{loginOTPError}</div>}
              <form onSubmit={handleLoginOTPVerify}>
                <div className="form-group">
                  <label className="form-label">OTP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loginOTPData.otp}
                    onChange={(e) => setLoginOTPData({ ...loginOTPData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    style={{ textAlign: "center", letterSpacing: "4px" }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loginOTPLoading}>
                  {loginOTPLoading ? "Verifying..." : "Verify & Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
