import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const Reports = () => {
  const [reportType, setReportType] = useState("financial");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = { ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) };
      const res = await admin.getFinancialReport(params);
      setReportData(res.data);
    } catch (error) {
      setReportData(null);
    } finally { setLoading(false); }
  };

  const exportReport = async (format) => {
    try {
      const res = await admin.exportReport(format, { dateFrom, dateTo });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${new Date().toISOString().split("T")[0]}.${format}`;
      link.click();
    } catch (error) {
      alert(`Export as ${format.toUpperCase()} would download`);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Generate and export reports</p>
      </div>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Generate Report</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 200 }}>
              <option value="financial">Financial Report</option>
              <option value="transactions">Transaction Report</option>
              <option value="users">User Report</option>
            </select>
          </div>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          </div>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label>To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: "0.75rem", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          </div>
          <button className="admin-btn admin-btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Report Summary</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => exportReport("csv")}>📥 CSV</button>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => exportReport("excel")}>📊 Excel</button>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => exportReport("pdf")}>📄 PDF</button>
            </div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card"><div className="stat-icon green">📈</div><div className="stat-info"><h3>{formatCurrency(reportData.totalDeposits)}</h3><p>Total Deposits</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon red">📉</div><div className="stat-info"><h3>{formatCurrency(reportData.totalWithdrawals)}</h3><p>Total Withdrawals</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon yellow">💰</div><div className="stat-info"><h3>{formatCurrency(reportData.totalLoansDisbursed)}</h3><p>Loans Disbursed</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon purple">💵</div><div className="stat-info"><h3>{formatCurrency(reportData.totalInterestEarned)}</h3><p>Interest Earned</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon blue">📊</div><div className="stat-info"><h3>{reportData.transactionCount}</h3><p>Transactions</p></div></div>
            <div className="admin-stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><h3>{reportData.newAccounts}</h3><p>New Accounts</p></div></div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: "1.5rem" }}>Quick Reports</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
            <h4>Daily Report</h4>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Today's transactions</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: "0.5rem" }}>View</button>
          </div>
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📆</div>
            <h4>Monthly Report</h4>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>This month's summary</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: "0.5rem" }}>View</button>
          </div>
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📆</div>
            <h4>Yearly Report</h4>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Annual summary</p>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: "0.5rem" }}>View</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
