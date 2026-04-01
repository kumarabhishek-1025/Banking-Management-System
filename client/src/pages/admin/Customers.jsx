import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", password: "",
    aadhaarNumber: "", panNumber: "", aadhaarDoc: null, panDoc: null
  });

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, search, statusFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = { 
        page: pagination.page, 
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      };
      const res = await admin.getUsers(params);
      setCustomers(res.data.users || []);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      setCustomers([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await admin.updateUser(editingCustomer._id, formData);
      } else {
        await admin.createUser(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      await admin.toggleUserStatus(customer._id);
      loadCustomers();
    } catch (error) {
      // Mock toggle
      setCustomers(customers.map(c => 
        c._id === customer._id ? { ...c, isActive: !c.isActive } : c
      ));
    }
  };

  const handleFreeze = async (customer) => {
    try {
      await admin.freezeUser(customer._id);
      alert(`Account ${customer.isActive ? "frozen" : "unfrozen"} successfully`);
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This will delete all their data including accounts, transactions, loans, etc.`)) return;
    try {
      await admin.deleteUser(customer._id);
      alert("Customer and all related data deleted successfully!");
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete customer");
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      postalCode: customer.postalCode || "",
      password: ""
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "", password: ""
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Customer Management</h1>
        <p className="page-subtitle">Manage all bank customers</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Customers ({pagination.total})</h3>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            ➕ Add Customer
          </button>
        </div>

        <div className="admin-search">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner"></div></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{customer.firstName} {customer.lastName}</div>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-badge ${customer.isActive ? "badge-success" : "badge-danger"}`}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-btn-group">
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEditModal(customer)}>
                          ✏️ Edit
                        </button>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm" 
                          onClick={() => handleToggleStatus(customer)}
                        >
                          {customer.isActive ? "⏸️" : "✅"}
                        </button>
                        <button 
                          className="admin-btn admin-btn-danger admin-btn-sm" 
                          onClick={() => handleDelete(customer)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <span className="admin-pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="admin-pagination-buttons">
                  <button 
                    className="admin-btn admin-btn-secondary"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </button>
                  <button 
                    className="admin-btn admin-btn-secondary"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>First Name *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Last Name *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={!!editingCustomer} />
                  </div>
                  <div className="admin-form-group">
                    <label>Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>State</label>
                    <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Postal Code</label>
                    <input type="text" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="admin-form-group">
                    <label>Aadhaar Number</label>
                    <input type="text" value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} placeholder="12-digit Aadhaar" maxLength={12} />
                  </div>
                  <div className="admin-form-group">
                    <label>PAN Number</label>
                    <input type="text" value={formData.panNumber} onChange={(e) => setFormData({...formData, panNumber: e.target.value})} placeholder="10-character PAN" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="admin-form-group">
                    <label>Aadhaar Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setFormData({...formData, aadhaarDoc: e.target.files[0]})} />
                  </div>
                  <div className="admin-form-group">
                    <label>PAN Document</label>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setFormData({...formData, panDoc: e.target.files[0]})} />
                  </div>
                  {!editingCustomer && (
                    <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Password *</label>
                      <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingCustomer} />
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingCustomer ? "Update" : "Create"} Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
