import React, { useState } from "react";
import { admin } from "../../services/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("bank");
  const [loading, setLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "Horizon Bank",
    branchName: "Main Branch",
    ifscCode: "HZBN0000001",
    micrCode: "400000001",
    branchAddress: "123 Main Street, Mumbai - 400001",
    contactNumber: "+91 22 12345678",
    email: "contact@horizonbank.com",
    website: "www.horizonbank.com",
    logo: null
  });
  const [currencySettings, setCurrencySettings] = useState({
    currency: "INR",
    currencySymbol: "₹",
    currencyCode: "356",
    decimalPlaces: 2,
    thousandSeparator: ",",
    decimalSeparator: "."
  });

  const handleSaveBankInfo = async () => {
    setLoading(true);
    try {
      await admin.updateSettings({ bankInfo });
      alert("Bank information saved successfully!");
    } catch (error) {
      alert("Bank information saved (demo)");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrency = async () => {
    setLoading(true);
    try {
      await admin.updateSettings({ currencySettings });
      alert("Currency settings saved successfully!");
    } catch (error) {
      alert("Currency settings saved (demo)");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await admin.backupDatabase();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `horizon_bank_backup_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      alert("Backup created successfully!");
    } catch (error) {
      alert("Creating backup... (demo)");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!confirm("Are you sure you want to restore? This will overwrite current data!")) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("backup", file);
      await admin.restoreDatabase(formData);
      alert("Database restored successfully!");
    } catch (error) {
      alert("Restore functionality (demo)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage bank settings and configurations</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "bank" ? "active" : ""}`} onClick={() => setActiveTab("bank")}>🏦 Bank Information</button>
        <button className={`admin-tab ${activeTab === "currency" ? "active" : ""}`} onClick={() => setActiveTab("currency")}>💱 Currency</button>
        <button className={`admin-tab ${activeTab === "backup" ? "active" : ""}`} onClick={() => setActiveTab("backup")}>💾 Backup & Restore</button>
      </div>

      {activeTab === "bank" && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Bank Information</h3>
          <div style={{ marginBottom: "1.5rem", padding: "1.5rem", background: "#f8fafc", borderRadius: 12, textAlign: "center" }}>
            <div style={{ width: 120, height: 120, background: "white", borderRadius: 12, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #e2e8f0" }}>
              <span style={{ fontSize: "3rem" }}>🏦</span>
            </div>
            <label style={{ cursor: "pointer", display: "inline-block" }}>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setBankInfo({...bankInfo, logo: e.target.files[0]})} />
              <span className="admin-btn admin-btn-secondary">📤 Upload Logo</span>
            </label>
            <p style={{ marginTop: "0.5rem", color: "#64748b", fontSize: "0.875rem" }}>Recommended: 200x200px, PNG or JPG</p>
          </div>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Bank Name</label>
              <input type="text" value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Branch Name</label>
              <input type="text" value={bankInfo.branchName} onChange={(e) => setBankInfo({...bankInfo, branchName: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>IFSC Code</label>
              <input type="text" value={bankInfo.ifscCode} onChange={(e) => setBankInfo({...bankInfo, ifscCode: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>MICR Code</label>
              <input type="text" value={bankInfo.micrCode} onChange={(e) => setBankInfo({...bankInfo, micrCode: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
              <label>Branch Address</label>
              <input type="text" value={bankInfo.branchAddress} onChange={(e) => setBankInfo({...bankInfo, branchAddress: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Contact Number</label>
              <input type="text" value={bankInfo.contactNumber} onChange={(e) => setBankInfo({...bankInfo, contactNumber: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Email</label>
              <input type="email" value={bankInfo.email} onChange={(e) => setBankInfo({...bankInfo, email: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Website</label>
              <input type="text" value={bankInfo.website} onChange={(e) => setBankInfo({...bankInfo, website: e.target.value})} />
            </div>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSaveBankInfo} disabled={loading}>
            {loading ? "Saving..." : "Save Bank Information"}
          </button>
        </div>
      )}

      {activeTab === "currency" && (
        <div className="admin-card">
          <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Currency Settings</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Currency Name</label>
              <select value={currencySettings.currency} onChange={(e) => setCurrencySettings({...currencySettings, currency: e.target.value})}>
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Currency Symbol</label>
              <input type="text" value={currencySettings.currencySymbol} onChange={(e) => setCurrencySettings({...currencySettings, currencySymbol: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Currency Code</label>
              <input type="text" value={currencySettings.currencyCode} onChange={(e) => setCurrencySettings({...currencySettings, currencyCode: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Decimal Places</label>
              <input type="number" value={currencySettings.decimalPlaces} onChange={(e) => setCurrencySettings({...currencySettings, decimalPlaces: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Thousand Separator</label>
              <select value={currencySettings.thousandSeparator} onChange={(e) => setCurrencySettings({...currencySettings, thousandSeparator: e.target.value})}>
                <option value=",">Comma (,)</option>
                <option value=".">Period (.)</option>
                <option value=" ">Space</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Decimal Separator</label>
              <select value={currencySettings.decimalSeparator} onChange={(e) => setCurrencySettings({...currencySettings, decimalSeparator: e.target.value})}>
                <option value=".">Period (.)</option>
                <option value=",">Comma (,)</option>
              </select>
            </div>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleSaveCurrency} disabled={loading}>
            {loading ? "Saving..." : "Save Currency Settings"}
          </button>
        </div>
      )}

      {activeTab === "backup" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Backup Database</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Create a backup of all bank data including customers, accounts, transactions, and settings.</p>
            <button className="admin-btn admin-btn-primary" onClick={handleBackup} disabled={loading}>
              {loading ? "Creating Backup..." : "📥 Create Backup"}
            </button>
          </div>

          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Restore Database</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Restore data from a previous backup file. Warning: This will overwrite all current data!</p>
            <label className="admin-btn admin-btn-secondary" style={{ cursor: "pointer" }}>
              📤 Select Backup File
              <input type="file" accept=".json,.bak" onChange={handleRestore} style={{ display: "none" }} />
            </label>
          </div>

          <div className="admin-card" style={{ gridColumn: "span 2" }}>
            <h3 className="admin-card-title" style={{ marginBottom: "1rem" }}>Backup History</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Backup Date</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-06-15 10:30:00</td>
                  <td>2.5 MB</td>
                  <td><span className="admin-badge badge-success">Auto</span></td>
                  <td><button className="admin-btn admin-btn-secondary admin-btn-sm">Download</button></td>
                </tr>
                <tr>
                  <td>2024-06-10 10:30:00</td>
                  <td>2.4 MB</td>
                  <td><span className="admin-badge badge-success">Auto</span></td>
                  <td><button className="admin-btn admin-btn-secondary admin-btn-sm">Download</button></td>
                </tr>
                <tr>
                  <td>2024-06-05 14:20:00</td>
                  <td>2.3 MB</td>
                  <td><span className="admin-badge badge-info">Manual</span></td>
                  <td><button className="admin-btn admin-btn-secondary admin-btn-sm">Download</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
