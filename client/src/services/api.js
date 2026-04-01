import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post("/auth/register", data),
  verifyRegistrationOTP: (data) => api.post("/auth/verify-registration-otp", data),
  resendRegistrationOTP: (data) => api.post("/auth/resend-registration-otp", data),
  login: (data) => api.post("/auth/login", data),
  verifyLoginOTP: (data) => api.post("/auth/verify-login-otp", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data)
};

export const accounts = {
  getAll: () => api.get("/accounts"),
  create: (data) => api.post("/accounts/create", data),
  getOne: (id) => api.get(`/accounts/${id}`),
  deposit: (id, data) => api.post(`/accounts/${id}/deposit`, data),
  withdraw: (id, data) => api.post(`/accounts/${id}/withdraw`, data),
  close: (id, data) => api.post(`/accounts/${id}/close`, data)
};

export const transfers = {
  send: (data) => api.post("/transfers/send", data),
  sendExternal: (data) => api.post("/transfers/external", data),
  getCharges: (type, amount) => api.get(`/transfers/charges/${type}/${amount}`),
  history: () => api.get("/transfers/history"),
  request: (data) => api.post("/transfers/request", data)
};

export const transactions = {
  getAll: (params) => api.get("/transactions", { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  payment: (data) => api.post("/transactions/payment", data),
  bill: (data) => api.post("/transactions/bill", data)
};

export const payments = {
  getConfig: () => api.get("/payments/config"),
  createOrder: (data) => api.post("/payments/create-order", data),
  verifyPayment: (data) => api.post("/payments/verify-payment", data),
  getPayment: (id) => api.get(`/payments/payment/${id}`)
};

export const loans = {
  apply: (data) => api.post("/loans/apply", data),
  getMyLoans: () => api.get("/loans/my-loans"),
  getAll: () => api.get("/loans/all"),
  getSchemes: () => api.get("/loan-schemes/schemes"),
  calculateEMI: (data) => api.post("/loan-schemes/calculate", data),
  updateStatus: (id, status) => api.patch(`/loans/${id}/status`, { status })
};

export const deposits = {
  getSchemes: (type) => api.get(`/deposits/schemes${type ? `?type=${type}` : ''}`),
  calculateFD: (data) => api.post("/deposits/calculate-fd", data),
  calculateRD: (data) => api.post("/deposits/calculate-rd", data),
  createFD: (data) => api.post("/deposits/create-fd", data),
  createRD: (data) => api.post("/deposits/create-rd", data),
  getMyFDs: () => api.get("/deposits/my-fds"),
  getMyRDs: () => api.get("/deposits/my-rds"),
  getAllFDs: () => api.get("/deposits/all-fds"),
  getAllRDs: () => api.get("/deposits/all-rds"),
  processRD: () => api.post("/deposits/process-rd")
};

export const admin = {
  // Dashboard
  getDashboard: () => api.get("/admin/dashboard"),
  getStats: () => api.get("/admin/stats"),
  
  // Users
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.post(`/admin/users/${id}/toggle-status`),
  freezeUser: (id) => api.post(`/admin/users/${id}/freeze`),
  
  // Accounts
  getAccounts: (params) => api.get("/admin/accounts", { params }),
  getAccountDetails: (id) => api.get(`/admin/accounts/${id}`),
  createAccount: (data) => api.post("/admin/accounts/create", data),
  updateAccount: (id, data) => api.patch(`/admin/accounts/${id}`, data),
  closeAccount: (id) => api.post(`/admin/accounts/${id}/close`),
  approveAccount: (id) => api.post(`/admin/accounts/${id}/approve`),
  freezeAccount: (id) => api.post(`/admin/accounts/${id}/freeze`),
  updateAccountLimits: (id, data) => api.post(`/admin/accounts/${id}/limits`, data),
  
  // Transactions
  getTransactions: (params) => api.get("/admin/transactions", { params }),
  getTransactionDetails: (id) => api.get(`/admin/transactions/${id}`),
  reverseTransaction: (id) => api.post(`/admin/transactions/${id}/reverse`),
  cancelTransaction: (id) => api.post(`/admin/transactions/${id}/cancel`),
  
  // Loans
  getLoans: (params) => api.get("/admin/loans", { params }),
  getLoanSchemes: () => api.get("/admin/loan-schemes"),
  createLoanScheme: (data) => api.post("/admin/loan-schemes", data),
  updateLoanScheme: (id, data) => api.patch(`/admin/loan-schemes/${id}`, data),
  deleteLoanScheme: (id) => api.delete(`/admin/loan-schemes/${id}`),
  reviewLoan: (id, data) => api.post(`/admin/loans/${id}/review`, data),
  
  // Fixed Deposits
  getFDs: (params) => api.get("/deposits/all-fds", { params }),
  approveFD: (id) => api.post(`/admin/fixed-deposits/${id}/approve`),
  
  // Recurring Deposits
  getRDs: (params) => api.get("/deposits/all-rds", { params }),
  approveRD: (id) => api.post(`/admin/recurring-deposits/${id}/approve`),
  
  // Deposit Schemes
  getDepositSchemes: (params) => api.get("/admin/deposit-schemes", { params }),
  createDepositScheme: (data) => api.post("/admin/deposit-schemes", data),
  updateDepositScheme: (id, data) => api.patch(`/admin/deposit-schemes/${id}`, data),
  deleteDepositScheme: (id) => api.delete(`/admin/deposit-schemes/${id}`),
  
  // Staff/Employees
  getStaff: (params) => api.get("/admin/staff", { params }),
  createStaff: (data) => api.post("/admin/staff", data),
  updateStaff: (id, data) => api.patch(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  updateStaffPermissions: (id, data) => api.post(`/admin/staff/${id}/permissions`, data),
  
  // Admins Management
  getAdmins: (params) => api.get("/admin/admins", { params }),
  createAdmin: (data) => api.post("/admin/admins", data),
  
  // KYC
  getKYC: (params) => api.get("/admin/kyc", { params }),
  getKYCDetails: (id) => api.get(`/admin/kyc/${id}`),
  reviewKYC: (id, data) => api.post(`/admin/kyc/${id}/review`, data),
  
  // Credit Cards
  getCreditCards: (params) => api.get("/admin/credit-cards", { params }),
  updateCreditLimit: (id, data) => api.post(`/admin/credit-cards/${id}/limit`, data),
  toggleCard: (id) => api.post(`/admin/credit-cards/${id}/toggle`),
  reviewCreditCard: (id, data) => api.post(`/admin/credit-cards/${id}/review`, data),
  
  // Cheque Books
  getChequeBooks: (params) => api.get("/admin/cheque-books", { params }),
  issueChequeBook: (id) => api.post(`/admin/cheque-books/${id}/issue`),
  
  // Branches
  getBranches: () => api.get("/admin/branches"),
  createBranch: (data) => api.post("/admin/branches", data),
  updateBranch: (id, data) => api.patch(`/admin/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/admin/branches/${id}`),
  
  // Reports
  getFinancialReport: (params) => api.get("/admin/reports/financial", { params }),
  getUserReport: (params) => api.get("/admin/reports/users", { params }),
  getTransactionReport: (params) => api.get("/admin/reports/transactions", { params }),
  exportReport: (type, params) => api.get(`/admin/reports/export/${type}`, { params, responseType: 'blob' }),
  
  // Notifications
  sendNotification: (userId, data) => api.post(`/admin/notify/${userId}`, data),
  broadcast: (data) => api.post("/admin/broadcast", data),
  getNotifications: (params) => api.get("/admin/notifications", { params }),
  
  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.patch("/admin/settings", data),
  updateInterestRates: (data) => api.patch("/admin/settings/interest-rates", data),
  updateCharges: (data) => api.patch("/admin/settings/charges", data),
  
  // Security
  getLoginLogs: (params) => api.get("/admin/security/login-logs", { params }),
  getBlockedIPs: () => api.get("/admin/security/blocked-ips"),
  blockIP: (ip) => api.post("/admin/security/block-ip", { ip }),
  unblockIP: (ip) => api.post("/admin/security/unblock-ip", { ip }),
  getAuditLogs: (params) => api.get("/admin/audit-logs", { params }),
  
  // Backup
  backupDatabase: () => api.post("/admin/backup"),
  restoreDatabase: (data) => api.post("/admin/restore", data)
};

export const staff = {
  // Dashboard
  getDashboard: () => api.get("/staff/dashboard"),
  
  // Customers
  searchCustomers: (params) => api.get("/staff/customers", { params }),
  getCustomerDetails: (id) => api.get(`/staff/customers/${id}`),
  getCustomerByAccount: (accountNumber) => api.get(`/staff/customer/account/${accountNumber}`),
  updateCustomer: (id, data) => api.patch(`/staff/customers/${id}`, data),
  
  // Operations
  deposit: (data) => api.post("/staff/deposit", data),
  withdraw: (data) => api.post("/staff/withdraw", data),
  transfer: (data) => api.post("/staff/transfer", data),
  createAccount: (data) => api.post("/staff/account/create", data),
  
  // Transactions
  getTransactions: (params) => api.get("/staff/transactions", { params }),
  
  // KYC
  getPendingKYC: (params) => api.get("/staff/kyc", { params }),
  reviewKYC: (id, data) => api.post(`/staff/kyc/${id}/review`, data),
  
  // Complaints
  getComplaints: (params) => api.get("/staff/complaints", { params }),
  respondToComplaint: (id, data) => api.post(`/staff/complaints/${id}/respond`, data),
  resolveComplaint: (id) => api.post(`/staff/complaints/${id}/resolve`),
  
  // Approvals
  getApprovalCounts: () => api.get("/staff/approvals/count"),
  getPendingApprovals: (type) => api.get(`/staff/approvals/pending${type ? `?type=${type}` : ''}`),
  approveAccount: (id) => api.post(`/staff/approve/account/${id}`),
  rejectAccount: (id, reason) => api.post(`/staff/reject/account/${id}`, { reason }),
  approveFD: (id) => api.post(`/staff/approve/fd/${id}`),
  rejectFD: (id, reason) => api.post(`/staff/reject/fd/${id}`, { reason }),
  approveRD: (id) => api.post(`/staff/approve/rd/${id}`),
  rejectRD: (id, reason) => api.post(`/staff/reject/rd/${id}`, { reason }),
  approveCard: (id) => api.post(`/staff/approve/card/${id}`),
  rejectCard: (id, reason) => api.post(`/staff/reject/card/${id}`, { reason }),
  approveCheque: (id) => api.post(`/staff/approve/cheque/${id}`),
  rejectCheque: (id, reason) => api.post(`/staff/reject/cheque/${id}`, { reason }),
  issueCheque: (id) => api.post(`/staff/issue/cheque/${id}`),
};

export const creditCards = {
  apply: (data) => api.post("/credit-cards/apply", data),
  getMyCards: () => api.get("/credit-cards/my-cards"),
  getOne: (id) => api.get(`/credit-cards/${id}`),
  payBill: (id, data) => api.post(`/credit-cards/${id}/pay-bill`, data),
  block: (id) => api.post(`/credit-cards/${id}/block`, data),
  getAll: () => api.get("/credit-cards/admin/all")
};

export const notifications = {
  getAll: (params) => api.get("/notifications", { params }),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  send: (data) => api.post("/notifications/send", data),
  broadcast: (data) => api.post("/notifications/broadcast", data)
};

export const chequeBooks = {
  request: (data) => api.post("/cheque-books/request", data),
  getMyChequeBooks: () => api.get("/cheque-books/my-chequebooks"),
  stopPayment: (data) => api.post("/cheque-books/stop-payment", data),
  getAll: () => api.get("/cheque-books/admin/all"),
  issue: (id) => api.post(`/cheque-books/${id}/issue`),
  deliver: (id) => api.post(`/cheque-books/${id}/deliver`)
};

export const recurringDeposits = {
  create: (data) => api.post("/recurring-deposits/create", data),
  getMyRDs: () => api.get("/recurring-deposits/my-rds"),
  getOne: (id) => api.get(`/recurring-deposits/${id}`),
  deposit: (id) => api.post(`/recurring-deposits/${id}/deposit`),
  getAll: () => api.get("/recurring-deposits/admin/all")
};

export const employees = {
  create: (data) => api.post("/employees/create", data),
  getAll: (params) => api.get("/employees/all", { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  login: (data) => api.post("/employees/login", data),
  forgotPassword: (data) => api.post("/employees/forgot-password", data),
  resetPassword: (data) => api.post("/employees/reset-password", data)
};

export const kyc = {
  start: () => api.post("/kyc/start"),
  submit: (data) => api.post("/kyc/submit", data),
  getStatus: () => api.get("/kyc/status"),
  getAll: (params) => api.get("/kyc/admin/all", { params }),
  review: (id, data) => api.post(`/kyc/admin/${id}/review`, data)
};

export const branches = {
  getAll: (params) => api.get("/branches", { params }),
  getOne: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post("/branches", data),
  update: (id, data) => api.patch(`/branches/${id}`, data)
};

export const statements = {
  getAccountStatement: (accountId, params) => api.get(`/statements/account/${accountId}`, { params }),
  getMiniStatement: (accountId) => api.get(`/statements/mini/${accountId}`),
  getConsolidated: (params) => api.get("/statements/consolidated", { params }),
  getSummary: () => api.get("/statements/summary")
};

export const analytics = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getUsers: (params) => api.get("/analytics/users", { params }),
  getTransactions: (params) => api.get("/analytics/transactions", { params }),
  getFinancial: () => api.get("/analytics/financial")
};

export const complaints = {
  create: (data) => api.post("/complaints", data),
  getMy: (params) => api.get("/complaints/my", { params }),
  getOne: (id) => api.get(`/complaints/${id}`),
  respond: (id, data) => api.post(`/complaints/${id}/respond`, data)
};

export default api;
