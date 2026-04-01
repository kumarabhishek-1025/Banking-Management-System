import React from "react";
import { Link } from "react-router-dom";

const ChooseLogin = () => {
  return (
    <div className="wrapper">
      {/* Background */}
      <div className="bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid"></div>
      </div>

      {/* Floating Icons */}
      <div className="float-icons">
        {["💰", "🏦", "💎", "📱", "💳", "🏠", "🚀", "⭐", "💵", "💸"].map((icon, i) => (
          <span key={i} className="f-icon" style={{
            left: `${8 + Math.random() * 84}%`,
            animationDuration: `${16 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 10}s`,
            fontSize: `${1.2 + Math.random() * 1}rem`
          }}>{icon}</span>
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon"><span>H</span></div>
          <div className="brand-name">
            <span>Horizon</span>
            <small>Bank</small>
          </div>
        </div>
        <Link to="/sign-up" className="join-btn">
          <span>Create Account</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Left Side - Text */}
        <div className="text-side">
          <div className="pill-badge">
            <span className="pill-dot"></span>
            <span>India's Trusted Banking Platform</span>
          </div>
          
          <h1 className="main-title">
            Welcome to<br/>
            <span className="gradient-text">Horizon Bank</span>
          </h1>
          
          <p className="main-desc">
            Experience next-generation banking with seamless transactions, 
            instant payments, and premium financial services.
          </p>

          <div className="features-list">
            <span className="feat">💰 Banking</span>
            <span className="feat">💳 Cards</span>
            <span className="feat">🏠 Loans</span>
            <span className="feat">📱 Payments</span>
            <span className="feat">🌐 Transfer</span>
          </div>

          <div className="stats-block">
            <div className="stat-box">
              <span className="stat-val">10M+</span>
              <span className="stat-lbl">Customers</span>
            </div>
            <div className="stat-div"></div>
            <div className="stat-box">
              <span className="stat-val">50K+</span>
              <span className="stat-lbl">Crore</span>
            </div>
            <div className="stat-div"></div>
            <div className="stat-box">
              <span className="stat-val">500+</span>
              <span className="stat-lbl">Cities</span>
            </div>
          </div>
        </div>

        {/* Right Side - Card & Options */}
        <div className="card-side">
          {/* Credit Card Visual */}
          <div className="card-visual">
            <div className="credit-card-large">
              <div className="card-sparkle"></div>
              <div className="card-inner">
                <div className="card-top-row">
                  <span className="card-chip-img">💳</span>
                  <span className="card-brand-name">HORIZON BANK</span>
                </div>
                <div className="card-number-display">•••• •••• •••• 7294</div>
                <div className="card-bottom-row">
                  <div className="card-person">
                    <span className="tiny-label">CARD HOLDER</span>
                    <span className="person-name">YOUR NAME</span>
                  </div>
                  <div className="card-date">
                    <span className="tiny-label">EXPIRES</span>
                    <span className="date-val">12/30</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-glow-effect"></div>
          </div>

          {/* Login Options Box */}
          <div className="options-box">
            <h2 className="options-heading">Select Your Portal</h2>
            
            <Link to="/sign-in" className="option-card customer">
              <div className="option-icon-box">
                <span className="option-emoji">👤</span>
              </div>
              <div className="option-details">
                <span className="option-title">Customer</span>
                <span className="option-subtitle">Personal banking & transactions</span>
              </div>
              <span className="option-arrow">→</span>
            </Link>

            <Link to="/admin-login" className="option-card admin">
              <div className="option-icon-box admin-bg">
                <span className="option-emoji">⚙️</span>
              </div>
              <div className="option-details">
                <span className="option-title">Admin</span>
                <span className="option-subtitle">Manage operations & users</span>
              </div>
              <span className="option-arrow">→</span>
            </Link>

            <Link to="/staff-login" className="option-card staff">
              <div className="option-icon-box staff-bg">
                <span className="option-emoji">👔</span>
              </div>
              <div className="option-details">
                <span className="option-title">Staff</span>
                <span className="option-subtitle">Staff portal & operations</span>
              </div>
              <span className="option-arrow">→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="foot">
        <p>© 2026 Horizon Bank. All rights reserved. Made with ❤️ in India</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Manrope', sans-serif;
          background: #050508;
          color: #fff;
          overflow-x: hidden;
        }

        .wrapper {
          min-height: 100vh;
          position: relative;
        }

        /* Background Effects */
        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          animation: orbFloat 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, #4f46e5 0%, #7c3aed 50%, transparent 70%);
          top: -250px;
          right: -150px;
        }

        .orb-2 {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, #0891b2 0%, #2563eb 50%, transparent 70%);
          bottom: -180px;
          left: -120px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, #db2777 0%, #e11d48 50%, transparent 70%);
          top: 40%;
          left: 35%;
          animation-delay: -14s;
          opacity: 0.5;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.02); }
          66% { transform: translate(-20px, 20px) scale(0.98); }
        }

        .grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 45px 45px;
        }

        /* Floating Icons */
        .float-icons {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .f-icon {
          position: absolute;
          bottom: -40px;
          opacity: 0;
          animation: floatUp linear infinite;
        }

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.25; }
          90% { opacity: 0.25; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.2rem 6%;
          z-index: 100;
          background: rgba(5, 5, 8, 0.9);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed, #db2777);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.4rem;
          box-shadow: 0 6px 25px rgba(79, 70, 229, 0.4);
        }

        .brand-name {
          display: flex;
          flex-direction: column;
        }

        .brand-name span {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .brand-name small {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .join-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1.6rem;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
        }

        .join-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
        }

        /* Main Content */
        .main-content {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 8%;
          padding: 9rem 6% 4rem;
          max-width: 1450px;
          margin: 0 auto;
          min-height: calc(100vh - 70px);
          align-items: center;
        }

        /* Text Side */
        .text-side {
          animation: slideLeft 0.8s ease-out;
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 1.2rem;
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.25);
          border-radius: 50px;
          font-size: 0.85rem;
          color: #a5b4fc;
          margin-bottom: 1.5rem;
        }

        .pill-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulseGlow 2s infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }

        .main-title {
          font-size: 4.2rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientFlow 5s ease infinite;
        }

        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .main-desc {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 450px;
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-bottom: 2.5rem;
        }

        .feat {
          padding: 0.55rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
        }

        .stats-block {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
        }

        .stat-val {
          font-size: 2rem;
          font-weight: 800;
        }

        .stat-lbl {
          font-size: 0.85rem;
          color: rgba(255,255,255, 0.4);
        }

        .stat-div {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.1);
        }

        /* Card Side */
        .card-side {
          animation: slideRight 0.8s ease-out 0.15s both;
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Credit Card Visual */
        .card-visual {
          display: flex;
          justify-content: center;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .credit-card-large {
          width: 380px;
          height: 235px;
          background: linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95);
          border-radius: 24px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          box-shadow: 0 35px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
          animation: cardFloat 5s ease-in-out infinite;
          z-index: 2;
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0) rotateY(-10deg) rotateX(5deg); }
          50% { transform: translateY(-15px) rotateY(-6deg) rotateX(0deg); }
        }

        .card-sparkle {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: cardShine 4s infinite;
        }

        @keyframes cardShine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .card-inner {
          position: relative;
          z-index: 1;
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-chip-img {
          font-size: 2rem;
        }

        .card-brand-name {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.5);
        }

        .card-number-display {
          font-size: 1.6rem;
          font-family: 'Courier New', monospace;
          letter-spacing: 5px;
          color: rgba(255,255,255,0.9);
          margin: 1rem 0;
        }

        .card-bottom-row {
          display: flex;
          justify-content: space-between;
        }

        .card-person, .card-date {
          display: flex;
          flex-direction: column;
        }

        .tiny-label {
          font-size: 0.6rem;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.45);
        }

        .person-name, .date-val {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .card-glow-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(79, 70, 229, 0.35), transparent 70%);
          z-index: 1;
        }

        /* Options Box */
        .options-box {
          background: rgba(255,255,255, 0.025);
          border: 1px solid rgba(255,255,255, 0.08);
          border-radius: 28px;
          padding: 2rem;
        }

        .options-heading {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255,255,255, 0.45);
          text-transform: uppercase;
          letter-spacing: 3px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .option-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 1.4rem;
          background: rgba(255,255,255, 0.02);
          border: 1px solid rgba(255,255,255, 0.06);
          border-radius: 16px;
          text-decoration: none;
          color: #fff;
          margin-bottom: 0.85rem;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .option-card:last-child { margin-bottom: 0; }

        .option-card:hover {
          transform: translateX(10px);
          background: rgba(255,255,255, 0.04);
          border-color: rgba(255,255,255, 0.12);
        }

        .option-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255, 0.08);
          font-size: 1.5rem;
          transition: transform 0.3s;
        }

        .option-card:hover .option-icon-box {
          transform: scale(1.08);
        }

        .option-icon-box.admin-bg {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15));
        }

        .option-card.admin:hover {
          background: rgba(239, 68, 68, 0.06);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .option-icon-box.staff-bg {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(107, 33, 217, 0.15));
        }

        .option-card.staff:hover {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .option-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-title {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .option-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255, 0.45);
        }

        .option-arrow {
          font-size: 1.5rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .option-card:hover .option-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Footer */
        .foot {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 1.5rem;
          color: rgba(255,255,255, 0.3);
          font-size: 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.03);
        }

        /* Responsive */
        @media (max-width: 1150px) {
          .main-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding-top: 7rem;
          }

          .text-side { text-align: center; }
          .main-desc { margin: 0 auto 1.5rem; }
          .features-list, .stats-block { justify-content: center; }
          .main-title { font-size: 3rem; }
        }

        @media (max-width: 550px) {
          .header { padding: 1rem 4%; }
          .main-content { padding: 6rem 4% 2rem; }
          .main-title { font-size: 2.25rem; }
          .main-desc { font-size: 1rem; }
          .credit-card-large { width: 300px; height: 185px; padding: 1.25rem; }
          .card-number-display { font-size: 1.2rem; }
          .options-box { padding: 1.5rem; }
          .option-card { padding: 1rem 1.1rem; }
          .option-icon-box { width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
};

export default ChooseLogin;
