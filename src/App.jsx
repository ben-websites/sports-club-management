
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Public & Auth Pages
import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import ServicesPage from "./pages/public/ServicesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// User Pages
import UserOverview from "./pages/user/UserOverview";
import MyMembership from "./pages/user/MyMembership";
import MonthlyFees from "./pages/user/MonthlyFees";
import VouchersPage from "./pages/user/VouchersPage";
import PaymentsHistory from "./pages/user/PaymentsHistory";
import UploadReceiptPage from "./pages/user/UploadReceiptPage";
import AdvancePaymentPage from "./pages/user/AdvancePaymentPage";
import AnnouncementsPage from "./pages/user/AnnouncementsPage";
import EventsPage from "./pages/user/EventsPage";
import ProfilePage from "./pages/user/ProfilePage";
import UserNotifications from "./pages/user/UserNotifications";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMemberships from "./pages/admin/AdminMemberships";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminVouchers from "./pages/admin/AdminVouchers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminFines from "./pages/admin/AdminFines";
import AdminAdvancePayments from "./pages/admin/AdminAdvancePayments";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSportsServices from "./pages/admin/AdminSportsServices";
import AdminNotifications from "./pages/admin/AdminNotifications";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* USER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute adminOnly={false} />}>
        <Route path="/user/dashboard" element={<UserOverview />} />
        <Route path="/user/membership" element={<MyMembership />} />
        <Route path="/user/fees" element={<MonthlyFees />} />
        <Route path="/user/vouchers" element={<VouchersPage />} />
        <Route path="/user/payments" element={<PaymentsHistory />} />
        <Route path="/user/upload-receipt" element={<UploadReceiptPage />} />
        <Route path="/user/advance-payment" element={<AdvancePaymentPage />} />
        <Route path="/user/announcements" element={<AnnouncementsPage />} />
        <Route path="/user/events" element={<EventsPage />} />
        <Route path="/user/notifications" element={<UserNotifications />} />
        <Route path="/user/profile" element={<ProfilePage />} />
      </Route>

      {/* ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/memberships" element={<AdminMemberships />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/vouchers" element={<AdminVouchers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/fines" element={<AdminFines />} />
        <Route path="/admin/advance-payments" element={<AdminAdvancePayments />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/sports-services" element={<AdminSportsServices />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid #27272a",
              borderRadius: "0px",
              fontSize: "12px",
              fontWeight: "600",
            },
            success: {
              iconTheme: {
                primary: "#f97316",
                secondary: "#000000",
              },
            },
          }}
        />

        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
