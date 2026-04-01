import React, { useState, useEffect } from "react";
import { creditCards as creditCardsApi, accounts as accountsApi } from "../services/api";

const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({ accountId: "", cardType: "gold", creditLimit: 50000 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardRes, accountRes] = await Promise.all([
        creditCardsApi.getMyCards(),
        accountsApi.getAll()
      ]);
      setCards(cardRes.data || []);
      setAccounts(accountRes.data.accounts || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await creditCardsApi.apply(formData);
      alert("Credit card applied successfully!");
      setShowModal(false);
      setFormData({ accountId: "", cardType: "gold", creditLimit: 50000 });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply for card");
    }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    try {
      await creditCardsApi.payBill(selectedCard._id, { amount: parseFloat(e.target.amount.value), fromAccountId: e.target.accountId.value });
      alert("Payment successful!");
      setShowPayModal(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    }
  };

  const handleBlock = async (cardId) => {
    if (!window.confirm("Are you sure you want to block this card?")) return;
    try {
      await creditCardsApi.block(cardId);
      alert("Card blocked successfully");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to block card");
    }
  };

  const formatCardNumber = (num) => {
    return num?.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••";
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Credit Cards</h1>
          <p className="page-subtitle">Manage your credit cards and payments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Apply for Card</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3 className="empty-title">No Credit Cards</h3>
            <p className="empty-text">Apply for a credit card to enjoy exclusive benefits.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Apply Now</button>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-label">Total Credit Limit</div>
                  <div className="stat-value">${cards.reduce((sum, c) => sum + c.creditLimit, 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon primary">💰</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-label">Total Used</div>
                  <div className="stat-value" style={{ color: "var(--warning)" }}>${cards.reduce((sum, c) => sum + c.outstandingAmount, 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon warning">📊</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div>
                  <div className="stat-label">Available Credit</div>
                  <div className="stat-value" style={{ color: "var(--success)" }}>${cards.reduce((sum, c) => sum + c.availableCredit, 0).toLocaleString()}</div>
                </div>
                <div className="stat-icon success">✓</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {cards.map((card) => (
              <div key={card._id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ 
                  background: card.cardType === "signature" ? "linear-gradient(135deg, #1a1a2e, #16213e)" :
                             card.cardType === "platinum" ? "linear-gradient(135deg, #4a148c, #7b1fa2)" :
                             card.cardType === "titanium" ? "linear-gradient(135deg, #263238, #37474f)" :
                             "linear-gradient(135deg, #f57f17, #ff8f00)",
                  padding: "1.5rem", color: "white" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>{card.cardType?.toUpperCase()} CARD</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>HORIZON BANK</div>
                  </div>
                  <div style={{ fontSize: "1.25rem", fontFamily: "monospace", letterSpacing: "2px", marginBottom: "1rem" }}>
                    {formatCardNumber(card.cardNumber)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>CARD HOLDER</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{card.cardHolderName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>EXPIRES</div>
                      <div style={{ fontSize: "0.9rem" }}>{String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Outstanding</span>
                    <span style={{ fontWeight: 600 }}>${card.outstandingAmount?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Credit Limit</span>
                    <span>${card.creditLimit?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Available</span>
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>${card.availableCredit?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => { setSelectedCard(card); setShowPayModal(true); }}
                      disabled={card.outstandingAmount <= 0}
                    >
                      Pay Bill
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1 }}
                      onClick={() => handleBlock(card._id)}
                    >
                      Block
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for Credit Card</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Link to Account</label>
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
                <label>Card Type</label>
                <select
                  className="form-input"
                  value={formData.cardType}
                  onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                >
                  <option value="gold">Gold - $50,000 Limit</option>
                  <option value="platinum">Platinum - $100,000 Limit</option>
                  <option value="titanium">Titanium - $250,000 Limit</option>
                  <option value="signature">Signature - $500,000 Limit</option>
                </select>
              </div>
              <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--gray-50)", borderRadius: 8 }}>
                <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}><strong>Annual Fees:</strong></p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Gold: $500 | Platinum: $1,000 | Titanium: $2,000 | Signature: $5,000</p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Apply for Card
              </button>
            </form>
          </div>
        </div>
      )}

      {showPayModal && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay Credit Card Bill</h3>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            <form onSubmit={handlePayBill}>
              <div style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: 8, marginBottom: "1rem" }}>
                <p style={{ marginBottom: "0.25rem" }}>Outstanding: <strong>${selectedCard.outstandingAmount?.toLocaleString()}</strong></p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Available Credit: ${selectedCard.availableCredit?.toLocaleString()}</p>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" name="amount" className="form-input" placeholder="Enter amount" max={selectedCard.outstandingAmount} required />
              </div>
              <div className="form-group">
                <label>Pay From Account</label>
                <select name="accountId" className="form-input" required>
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.bankName} - **** {acc.accountNumber?.slice(-4)} (${acc.availableBalance?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Pay Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
