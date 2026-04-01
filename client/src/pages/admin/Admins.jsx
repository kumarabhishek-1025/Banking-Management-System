import React, { useState, useEffect } from "react";
import { admin } from "../../services/api";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", department: "administration", designation: "Administrator"
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadAdmins();
  }, [search]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      let params = {};
      if (search) params.search = search;
      const res = await admin.getAdmins(params);
      // Filter out current logged in admin
      const filtered = res.data.filter(a => a._id !== currentUser?._id);
      setAdmins(filtered);
    } catch (error) {
      console.error("Failed to load admins:", error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const { password, ...updates } = formData;
        await admin.updateStaff(editingAdmin._id, password ? formData : updates);
      } else {
        await admin.createAdmin(formData);
      }
      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", password: "", department: "administration", designation: "Administrator" });
      loadAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      password: "",
      department: admin.department || "administration",
      designation: admin.designation || "Administrator"
    });
    setShowModal(true);
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Are you sure you want to delete admin: ${admin.email}?`)) return;
    try {
      await admin.deleteStaff(admin._id);
      loadAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await admin.updateStaff(admin._id, { isActive: !admin.isActive });
      loadAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-gray-600">Manage other administrators (excluding you)</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingAdmin(null); setFormData({ firstName: "", lastName: "", email: "", phone: "", password: "", department: "administration", designation: "Administrator" }); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add Admin
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 px-4 py-2 border rounded-lg" />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No other admins found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{admin.firstName} {admin.lastName}</td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">{admin.phone || "-"}</td>
                  <td className="px-6 py-4">{admin.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(admin)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleToggleStatus(admin)} className={`${admin.isActive ? "text-red-600" : "text-green-600"} hover:underline mr-3`}>
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(admin)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingAdmin ? "Edit Admin" : "Add New Admin"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required disabled={editingAdmin} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password {editingAdmin && "(leave blank to keep same)"}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required={!editingAdmin} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="administration">Administration</option>
                  <option value="operations">Operations</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingAdmin ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;