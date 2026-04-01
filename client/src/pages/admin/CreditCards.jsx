import React, { useState, useEffect } from "react";
import { admin, creditCards } from "../../services/api";

const CreditCardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [limitModal, setLimitModal] = useState(false);
  const [newLimit, setNewLimit] = useState(0);

  useEffect(() => { loadCards(); }, [statusFilter]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await admin.getCreditCards(params);
      setCards(res.data.cards || []);
    } catch (error) {
      setCards([]);
    } finally { setLoading(false); }
  };

  const handleToggle = async (card) => {
    try {
      await admin.toggleCard(card._id);
      loadCards();
    } catch (error) { setCards(cards.map(c => c._id === card._id ? { ...c, status: c.status === "active" ? "blocked" : "active" } : c)); }
  };

  const handleUpdateLimit = async () => {
    try {
      await admin.updateCreditLimit(selectedCard._id, { creditLimit: newLimit });
      setLimitModal(false); loadCards();
    } catch (error) { setCards(cards.map(c => c._id === selectedCard._id ? { ...c, creditLimit: newLimit, availableCredit: newLimit - (c.creditLimit - c.availableCredit) } : c)); setLimitModal(false); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  const getStatusBadge = (status) => ({ active: "badge-success", blocked: "badge-danger", pending: "badge-warning", closed: "badge-default" }[status] || "badge-default");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Credit Card Management</h1>
        <p className="page-subtitle">Manage credit cards and limits</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Cards</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Card Number</th><th>Type</th><th>Limit</th><th>Used</th><th>Available</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card._id}>
                  <td style={{ fontWeight: 600 }}>{card.user?.firstName} {card.user?.lastName}</td>
                  <td style={{ fontFamily: "monospace" }}>{card.cardNumber}</td>
                  <td><span className="admin-badge badge-info">{card.cardType}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(card.creditLimit)}</td>
                  <td style={{ color: "#dc2626" }}>{formatCurrency(card.creditLimit - card.availableCredit)}</td>
                  <td style={{ color: "#16a34a" }}>{formatCurrency(card.availableCredit)}</td>
                  <td>₹{card.annualFee}/yr</td>
                  <td><span className={`admin-badge ${getStatusBadge(card.status)}`}>{card.status}</span></td>
                  <td>
                    <div className="admin-btn-group">
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setSelectedCard(card); setNewLimit(card.creditLimit); setLimitModal(true); }}>Limit</button>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleToggle(card)}>{card.status === "active" ? "Block" : "Unblock"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {limitModal && selectedCard && (
        <div className="admin-modal-overlay" onClick={() => setLimitModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3 className="admin-modal-title">Update Credit Limit</h3><button className="admin-modal-close" onClick={() => setLimitModal(false)}>×</button></div>
            <div className="admin-modal-body">
              <p>Card: {selectedCard.cardNumber}</p>
              <p>Current Limit: {formatCurrency(selectedCard.creditLimit)}</p>
              <div className="admin-form-group"><label>New Limit (₹)</label><input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} /></div>
            </div>
            <div className="admin-modal-footer"><button className="admin-btn admin-btn-secondary" onClick={() => setLimitModal(false)}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={handleUpdateLimit}>Update</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardManagement;
