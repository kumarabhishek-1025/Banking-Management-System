import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Payments from "./pages/Payments";
import PaymentPage from "./pages/PaymentPage";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import StaffLayout from "./components/StaffLayout";
import FixedDeposits from "./pages/FixedDeposits";
import CreditCards from "./pages/CreditCards";
import Notifications from "./pages/Notifications";
import Statements from "./pages/Statements";
import RecurringDeposits from "./pages/RecurringDeposits";
import Loans from "./pages/Loans";
import ChequeBooks from "./pages/ChequeBooks";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Customers from "./pages/admin/Customers";
import AdminAccounts from "./pages/admin/Accounts";
import AdminTransactions from "./pages/admin/Transactions";
import AdminLoans from "./pages/admin/Loans";
import AdminStaff from "./pages/admin/Staff";
import AdminKYC from "./pages/admin/KYC";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminDeposits from "./pages/admin/Deposits";
import AdminCreditCards from "./pages/admin/CreditCards";
import AdminChequeBooks from "./pages/admin/ChequeBooks";
import AdminSecurity from "./pages/admin/Security";
import AdminInterest from "./pages/admin/Interest";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import AdminNotificationsPage from "./pages/admin/NotificationsPage";
import Admins from "./pages/admin/Admins";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffCustomers from "./pages/staff/Customers";
import StaffOperations from "./pages/staff/Operations";
import StaffTransactions from "./pages/staff/Transactions";
import StaffKYC from "./pages/staff/KYC";
import StaffComplaints from "./pages/staff/Complaints";
import StaffProfile from "./pages/staff/Profile";
import ChooseLogin from "./pages/ChooseLogin";
import Home from "./pages/Home";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const IndexRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (token && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (token && ["teller", "manager", "clerk", "auditor", "support"].includes(user.role)) {
    return <Navigate to="/staff" replace />;
  }
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return token && user.role === "admin" ? children : <Navigate to="/admin-login" />;
};

const StaffRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const staffRoles = ["teller", "manager", "clerk", "auditor", "support"];
  return token && staffRoles.includes(user.role) ? children : <Navigate to="/staff-login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChooseLogin />} />
        <Route path="/index" element={<IndexRoute />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="payments" element={<Payments />} />
          <Route path="add-money" element={<PaymentPage />} />
          <Route path="fixed-deposits" element={<FixedDeposits />} />
          <Route path="credit-cards" element={<CreditCards />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="statements" element={<Statements />} />
          <Route path="recurring-deposits" element={<RecurringDeposits />} />
          <Route path="loans" element={<Loans />} />
          <Route path="cheque-books" element={<ChequeBooks />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="admins" element={<Admins />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="loans" element={<AdminLoans />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="credit-cards" element={<AdminCreditCards />} />
          <Route path="cheque-books" element={<AdminChequeBooks />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="interest" element={<AdminInterest />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/staff-login" element={<StaffLogin />} />

        <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="customers" element={<StaffCustomers />} />
          <Route path="operations" element={<StaffOperations />} />
          <Route path="transactions" element={<StaffTransactions />} />
          <Route path="kyc" element={<StaffKYC />} />
          <Route path="complaints" element={<StaffComplaints />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
