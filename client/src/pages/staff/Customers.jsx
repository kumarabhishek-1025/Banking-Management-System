import React, { useState, useEffect } from "react";
import { staff as staffApi } from "../../services/api";

const StaffCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = search ? { [searchType]: search } : {};
      const { data } = await staffApi.searchCustomers(params);
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer) => {
    try {
      const { data } = await staffApi.getCustomerDetails(customer._id);
      setSelectedCustomer(data);
      setShowModal(true);
    } catch (error) {
      setSelectedCustomer(customer);
      setShowModal(true);
    }
  };

  const handleUpdateDetails = async () => {
    try {
      await staffApi.updateCustomer(selectedCustomer._id, editData);
      alert("Customer details updated successfully!");
      setShowModal(false);
      loadCustomers();
    } catch (error) {
      alert("Failed to update customer details");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = { active: "badge-success", inactive: "badge-default", frozen: "badge-danger", pending: "badge-warning" };
    return badges[status] || "badge-default";
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Customer Management</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Search and view customer details</p>
      </div>

      <div className="staff-card">
        <div className="staff-search">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="name">By Name</option>
            <option value="accountNumber">By Account Number</option>
            <option value="phone">By Phone</option>
            <option value="email">By Email</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="staff-btn staff-btn-primary" onClick={loadCustomers}>Search</button>
        </div>

        {loading ? (
          <div className="staff-loading"><div className="staff-spinner"></div></div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Account Number</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>KYC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{customer.firstName} {customer.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.email}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{customer.accountNumber || 'N/A'}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>{formatCurrency(customer.balance)}</td>
                  <td>
                    <span className={`staff-badge ${customer.kycVerified ? 'badge-success' : 'badge-warning'}`}>
                      {customer.kycVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="staff-btn staff-btn-secondary staff-btn-sm" onClick={() => handleViewDetails(customer)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="staff-empty">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedCustomer && (
        <div className="staff-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="staff-modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3 className="staff-modal-title">Customer Details</h3>
              <button className="staff-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full Name</div>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Number</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedCustomer.accountNumber || 'N/A'}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.email}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone</div>
                  <div style={{ fontWeight: 600 }}>{selectedCustomer.phone || 'N/A'}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Balance</div>
                  <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '1.25rem' }}>{formatCurrency(selectedCustomer.balance)}</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Status</div>
                  <span className={`staff-badge ${getStatusBadge(selectedCustomer.status)}`}>{selectedCustomer.status || 'active'}</span>
                </div>
              </div>

              <h4 style={{ marginBottom: '1rem' }}>Update Basic Details</h4>
              <div className="staff-form-grid">
                <div className="staff-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={editData.phone || selectedCustomer.phone || ''} 
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={editData.address || selectedCustomer.address || ''} 
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="staff-modal-footer">
              <button className="staff-btn staff-btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button className="staff-btn staff-btn-primary" onClick={handleUpdateDetails}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffCustomers;
