import React, { useState, useEffect } from "react";
import { admin, employees } from "../../services/api";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "teller", department: "operations", designation: "", password: "" });
  const [permissions, setPermissions] = useState({});

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await admin.getStaff();
      setStaff(res.data || []);
    } catch (error) {
      setStaff([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) await admin.updateStaff(editingStaff._id, formData);
      else await admin.createStaff(formData);
      setShowModal(false); loadStaff();
    } catch (error) {
      if (editingStaff) setStaff(staff.map(s => s._id === editingStaff._id ? { ...s, ...formData } : s));
      else setStaff([...staff, { _id: Date.now().toString(), ...formData, isActive: true, permissions: { users: false, accounts: false, transactions: false, loans: false } }]);
      setShowModal(false);
    }
  };

  const handleDelete = async (member) => {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}?`)) return;
    try {
      await admin.deleteStaff(member._id);
      loadStaff();
    } catch (error) { setStaff(staff.filter(s => s._id !== member._id)); }
  };

  const updatePermissions = async (member, perm, value) => {
    const newPerms = { ...member.permissions, [perm]: value };
    try {
      await admin.updateStaffPermissions(member._id, newPerms);
      loadStaff();
    } catch (error) { setStaff(staff.map(s => s._id === member._id ? { ...s, permissions: newPerms } : s)); }
  };

  const getRoleBadge = (role) => ({ manager: "badge-success", teller: "badge-info", auditor: "badge-warning" }[role] || "badge-default");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Staff Management</h1>
        <p className="page-subtitle">Manage bank staff and their permissions</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Staff ({staff.length})</h3>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditingStaff(null); setFormData({ firstName: "", lastName: "", email: "", phone: "", role: "teller", department: "operations", designation: "", password: "" }); setShowModal(true); }}>
            ➕ Add Staff
          </button>
        </div>

        {loading ? <div className="admin-loading"><div className="admin-spinner"></div></div> : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id}>
                  <td style={{ fontWeight: 600 }}>{member.firstName} {member.lastName}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td><span className={`admin-badge ${getRoleBadge(member.role)}`}>{member.role}</span></td>
                  <td>{member.department}</td>
                  <td><span className={`admin-badge ${member.isActive ? "badge-success" : "badge-danger"}`}>{member.isActive ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div className="admin-btn-group">
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setEditingStaff(member); setFormData(member); setShowModal(true); }}>Edit</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(member)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <div className="admin-card-header"><h3 className="admin-card-title">Role Permissions</h3></div>
        <table className="admin-table">
          <thead><tr><th>Staff</th><th>Users</th><th>Accounts</th><th>Transactions</th><th>Loans</th></tr></thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member._id}>
                <td>{member.firstName} {member.lastName}</td>
                <td><input type="checkbox" checked={member.permissions?.users || false} onChange={(e) => updatePermissions(member, "users", e.target.checked)} /></td>
                <td><input type="checkbox" checked={member.permissions?.accounts || false} onChange={(e) => updatePermissions(member, "accounts", e.target.checked)} /></td>
                <td><input type="checkbox" checked={member.permissions?.transactions || false} onChange={(e) => updatePermissions(member, "transactions", e.target.checked)} /></td>
                <td><input type="checkbox" checked={member.permissions?.loans || false} onChange={(e) => updatePermissions(member, "loans", e.target.checked)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3 className="admin-modal-title">{editingStaff ? "Edit Staff" : "Add New Staff"}</h3><button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>First Name *</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div className="admin-form-group"><label>Last Name *</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                  <div className="admin-form-group"><label>Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={!!editingStaff} /></div>
                  <div className="admin-form-group"><label>Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="admin-form-group"><label>Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}><option value="teller">Teller</option><option value="manager">Manager</option><option value="auditor">Auditor</option></select></div>
                  <div className="admin-form-group"><label>Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} /></div>
                  <div className="admin-form-group"><label>Designation</label><input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} /></div>
                  {!editingStaff && <div className="admin-form-group"><label>Password *</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>}
                </div>
              </div>
              <div className="admin-modal-footer"><button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="admin-btn admin-btn-primary">{editingStaff ? "Update" : "Create"} Staff</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
