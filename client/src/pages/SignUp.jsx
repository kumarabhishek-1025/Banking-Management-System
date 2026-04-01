import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    dateOfBirth: "",
    ssn: ""
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showDemoOTP, setShowDemoOTP] = useState(false);
  const [demoOTP, setDemoOTP] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowDemoOTP(false);

    try {
      const { data } = await auth.register(formData);
      
      if (data.pending) {
        setUserId(data.userId);
        setStep(2);
        // Show OTP only if email failed
        if (data.otp) {
          setShowDemoOTP(true);
          setDemoOTP(data.otp);
        }
        // Start resend timer
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
      } else if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await auth.verifyRegistrationOTP({ userId, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);

    try {
      await auth.resendRegistrationOTP({ userId });
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
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
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

          {step === 1 ? (
            <>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join Horizon Bank today</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="auth-row">
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-input"
                      placeholder="Postal code"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      className="form-input"
                      placeholder="DOB"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Sending OTP..." : "Create Account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="auth-title">Verify Email</h1>
              <p className="auth-subtitle">Enter the OTP sent to {formData.email}</p>

              <form className="auth-form" onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    style={{ textAlign: "center", letterSpacing: "8px", fontSize: "24px" }}
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                {showDemoOTP && (
                  <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "8px", marginBottom: "15px", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#2e7d32", fontSize: "14px" }}>Demo OTP (Email not sent):</p>
                    <p style={{ margin: "5px 0 0", fontSize: "28px", fontWeight: "bold", color: "#1b5e20", letterSpacing: "6px" }}>{demoOTP}</p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account" }
                </button>

                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  {resendTimer > 0 ? (
                    <span style={{ color: "#666" }}>Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="btn-link"
                      style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-link"
                  style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginTop: "10px", display: "block", width: "100%", textAlign: "center" }}
                >
                  Change Details
                </button>
              </form>
            </>
          )}

          <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link to="/" style={{ color: "#667eea", textDecoration: "none", marginBottom: "0.5rem" }}>← Back to Home</Link>
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
