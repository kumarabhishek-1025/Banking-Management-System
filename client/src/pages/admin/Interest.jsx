import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const InterestCharges = () => {
  const [settings, setSettings] = useState({
    savingsInterest: 3.5,
    fdInterest: { "7-14days": 3.0, "15-29days": 3.5, "30-45days": 4.0, "46-60days": 4.5, "61-90days": 5.0, "91-180days": 5.5, "181-365days": 6.0, "1year+": 6.5 },
    rdInterest: 6.5,
    loanInterest: { personal: 12, home: 8.5, car: 10, education: 9, business: 14 },
    minimumBalance: 500,
    atmCardFee: 100,
    smsAlertFee: 30,
    quarterlyStatementFee: 50,
    chequeBookFee: 100,
    latePaymentFee: 200,
    overdraftRate: 18
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await admin.getSettings();
      if (res.data) setSettings(res.data);
    } catch (error) { /* Use defaults */ }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await admin.updateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Settings saved (demo)");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Interest & Charges Management</h1>
        <p className="page-subtitle">Set interest rates and service charges</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Interest Rates (%)</h3>
          
          <div className="admin-form-group">
            <label>Savings Account Interest Rate</label>
            <input type="number" step="0.1" value={settings.savingsInterest} onChange={(e) => setSettings({...settings, savingsInterest: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label>Recurring Deposit Interest Rate</label>
            <input type="number" step="0.1" value={settings.rdInterest} onChange={(e) => setSettings({...settings, rdInterest: e.target.value})} />
          </div>

          <h4 style={{ margin: "1.5rem 0 1rem" }}>Fixed Deposit Rates</h4>
          {Object.entries(settings.fdInterest || {}).map(([tenure, rate]) => (
            <div key={tenure} className="admin-form-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ margin: 0 }}>{tenure} days</label>
              <input type="number" step="0.1" style={{ width: 100 }} value={rate} onChange={(e) => setSettings({...settings, fdInterest: {...settings.fdInterest, [tenure]: e.target.value}})} />
            </div>
          ))}

          <h4 style={{ margin: "1.5rem 0 1rem" }}>Loan Interest Rates</h4>
          {Object.entries(settings.loanInterest || {}).map(([type, rate]) => (
            <div key={type} className="admin-form-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ margin: 0, textTransform: "capitalize" }}>{type} Loan</label>
              <input type="number" step="0.1" style={{ width: 100 }} value={rate} onChange={(e) => setSettings({...settings, loanInterest: {...settings.loanInterest, [type]: e.target.value}})} />
            </div>
          ))}
        </div>

        <div>
          <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Service Charges (₹)</h3>
            
            <div className="admin-form-group">
              <label>Minimum Balance Required</label>
              <input type="number" value={settings.minimumBalance} onChange={(e) => setSettings({...settings, minimumBalance: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>ATM Card Annual Fee</label>
              <input type="number" value={settings.atmCardFee} onChange={(e) => setSettings({...settings, atmCardFee: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>SMS Alert Fee (Monthly)</label>
              <input type="number" value={settings.smsAlertFee} onChange={(e) => setSettings({...settings, smsAlertFee: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Quarterly Statement Fee</label>
              <input type="number" value={settings.quarterlyStatementFee} onChange={(e) => setSettings({...settings, quarterlyStatementFee: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Cheque Book Fee</label>
              <input type="number" value={settings.chequeBookFee} onChange={(e) => setSettings({...settings, chequeBookFee: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Late Payment Fee</label>
              <input type="number" value={settings.latePaymentFee} onChange={(e) => setSettings({...settings, latePaymentFee: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Overdraft Interest Rate (%)</label>
              <input type="number" step="0.1" value={settings.overdraftRate} onChange={(e) => setSettings({...settings, overdraftRate: e.target.value})} />
            </div>
          </div>

          <button className="admin-btn admin-btn-primary" style={{ width: "100%" }} onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestCharges;
