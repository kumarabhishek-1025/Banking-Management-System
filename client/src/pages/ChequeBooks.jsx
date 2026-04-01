import React, { useState, useEffect } from "react";
import { chequeBooks as chequeBooksApi, accounts as accountsApi } from "../services/api";

const ChequeBooks = () => {
  const [chequeBooks, setChequeBooks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [formData, setFormData] = useState({ accountId: "", leafCount: 25, deliveryMode: "courier", deliveryAddress: "" });
  const [stopData, setStopData] = useState({ accountId: "", chequeNumber: "", reason: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cbRes, accountRes] = await Promise.all([
        chequeBooksApi.getMyChequeBooks(),
        accountsApi.getAll()
      ]);
      setChequeBooks(cbRes.data || []);
      setAccounts(accountRes.data.accounts || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await chequeBooksApi.request(formData);
      alert("Cheque book requested successfully!");
      setShowModal(false);
      setFormData({ accountId: "", leafCount: 25, deliveryMode: "courier", deliveryAddress: "" });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request cheque book");
    }
  };

  const handleStopPayment = async (e) => {
    e.preventDefault();
    try {
      await chequeBooksApi.stopPayment(stopData);
      alert("Stop payment registered successfully! Charges: $150");
      setShowStopModal(false);
      setStopData({ accountId: "", chequeNumber: "", reason: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register stop payment");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Cheque Books</h1>
          <p className="page-subtitle">Request cheque books and manage stop payments</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={() => setShowStopModal(true)}>Stop Payment</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Request Cheque Book</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : chequeBooks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No Cheque Books</h3>
            <p className="empty-text">Request a cheque book to make payments via cheque.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Request Now</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Cheque Book No.</th>
                <th>Account</th>
                <th>Cheque Numbers</th>
                <th>Leaves</th>
                <th>Issue Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {chequeBooks.map((cb) => (
                <tr key={cb._id}>
                  <td style={{ fontFamily: "monospace" }}>{cb.chequeBookNumber}</td>
                  <td>
                    <div>{cb.account?.bankName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>****{cb.account?.accountNumber?.slice(-4)}</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {cb.startChequeNumber} - {cb.endChequeNumber}
                  </td>
                  <td>{cb.leafCount}</td>
                  <td>{formatDate(cb.issueDate)}</td>
                  <td>
                    <span className={`badge ${
                      cb.status === "delivered" ? "badge-success" :
                      cb.status === "issued" ? "badge-primary" :
                      cb.status === "cancelled" ? "badge-danger" : "badge-warning"
                    }`}>
                      {cb.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Cheque Book</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleRequest}>
              <div className="form-group">
                <label>Select Account</label>
                <select
                  className="form-input"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.bankName} - **** {acc.accountNumber?.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Number of Leaves</label>
                <select
                  className="form-input"
                  value={formData.leafCount}
                  onChange={(e) => setFormData({ ...formData, leafCount: parseInt(e.target.value) })}
                >
                  <option value="10">10 Leaves</option>
                  <option value="25">25 Leaves</option>
                  <option value="50">50 Leaves</option>
                  <option value="100">100 Leaves</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delivery Mode</label>
                <select
                  className="form-input"
                  value={formData.deliveryMode}
                  onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                >
                  <option value="courier">Courier Delivery</option>
                  <option value="branch_pickup">Branch Pickup</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Request Cheque Book
              </button>
            </form>
          </div>
        </div>
      )}

      {showStopModal && (
        <div className="modal-overlay" onClick={() => setShowStopModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Stop Payment</h3>
              <button className="modal-close" onClick={() => setShowStopModal(false)}>×</button>
            </div>
            <form onSubmit={handleStopPayment}>
              <div className="form-group">
                <label>Select Account</label>
                <select
                  className="form-input"
                  value={stopData.accountId}
                  onChange={(e) => setStopData({ ...stopData, accountId: e.target.value })}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.bankName} - **** {acc.accountNumber?.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cheque Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={stopData.chequeNumber}
                  onChange={(e) => setStopData({ ...stopData, chequeNumber: e.target.value })}
                  placeholder="Enter cheque number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  className="form-input"
                  value={stopData.reason}
                  onChange={(e) => setStopData({ ...stopData, reason: e.target.value })}
                  placeholder="Enter reason for stop payment"
                  rows="3"
                  required
                />
              </div>
              <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--gray-50)", borderRadius: 8 }}>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                  <strong>Charges:</strong> $150 per cheque
                </p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Register Stop Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequeBooks;
