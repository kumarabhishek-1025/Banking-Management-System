import React, { useState, useEffect } from "react";
import { admin, chequeBooks } from "../../services/api";

const ChequeBookManagement = () => {
  const [chequeBooks, setChequeBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { loadChequeBooks(); }, [statusFilter]);

  const loadChequeBooks = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await admin.getChequeBooks(params);
      setChequeBooks(res.data.chequeBooks || []);
    } catch (error) {
      setChequeBooks([]);
    } finally { setLoading(false); }
  };

  const handleIssue = async (cheque) => {
    try {
      await admin.issueChequeBook(cheque._id);
      loadChequeBooks();
    } catch (error) { setChequeBooks(chequeBooks.map(c => c._id === cheque._id ? { ...c, status: "issued", issuedAt: new Date().toISOString().split("T")[0] } : c)); }
  };

  const handleDeliver = async (cheque) => {
    try {
      await admin.issueChequeBook(cheque._id); // Using same endpoint for now
      loadChequeBooks();
    } catch (error) { setChequeBooks(chequeBooks.map(c => c._id === cheque._id ? { ...c, status: "delivered", deliveredAt: new Date().toISOString().split("T")[0] } : c)); }
  };

  const getStatusBadge = (status) => ({ issued: "badge-info", delivered: "badge-success", pending: "badge-warning", cancelled: "badge-default" }[status] || "badge-default");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Cheque Book Management</h1>
        <p className="page-subtitle">Manage cheque book requests</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Cheque Book Requests</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="issued">Issued</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Account</th><th>Cheques</th><th>Issued Date</th><th>Delivered Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {chequeBooks.map((cheque) => (
                <tr key={cheque._id}>
                  <td style={{ fontWeight: 600 }}>{cheque.user?.firstName} {cheque.user?.lastName}</td>
                  <td style={{ fontFamily: "monospace" }}>{cheque.accountNumber}</td>
                  <td>{cheque.chequeCount} leaves</td>
                  <td>{cheque.issuedAt ? new Date(cheque.issuedAt).toLocaleDateString() : "-"}</td>
                  <td>{cheque.deliveredAt ? new Date(cheque.deliveredAt).toLocaleDateString() : "-"}</td>
                  <td><span className={`admin-badge ${getStatusBadge(cheque.status)}`}>{cheque.status}</span></td>
                  <td>
                    <div className="admin-btn-group">
                      {cheque.status === "pending" && <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleIssue(cheque)}>Issue</button>}
                      {cheque.status === "issued" && <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleDeliver(cheque)}>Mark Delivered</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ChequeBookManagement;
