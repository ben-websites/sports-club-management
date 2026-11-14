
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
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
import UserSportsEnrollment from "./pages/user/UserSportsEnrollment";
import UserTrainingSchedule from "./pages/user/UserTrainingSchedule";
import UserPerformance from "./pages/user/UserPerformance";
import MonthlyFees from "./pages/user/MonthlyFees";
import VouchersPage from "./pages/user/VouchersPage";
import PaymentsHistory from "./pages/user/PaymentsHistory";
import UploadReceiptPage from "./pages/user/UploadReceiptPage";
import AdvancePaymentPage from "./pages/user/AdvancePaymentPage";
import AnnouncementsPage from "./pages/user/AnnouncementsPage";
import EventsPage from "./pages/user/EventsPage";
import ProfilePage from "./pages/user/ProfilePage";
import UserNotifications from "./pages/user/UserNotifications";
import UserReports from "./pages/user/UserReports";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMemberships from "./pages/admin/AdminMemberships";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminEquipment from "./pages/admin/AdminEquipment";
import AdminReportsAnalytics from "./pages/admin/AdminReportsAnalytics";
import AdminVouchers from "./pages/admin/AdminVouchers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminFines from "./pages/admin/AdminFines";
import AdminAdvancePayments from "./pages/admin/AdminAdvancePayments";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSportsServices from "./pages/admin/AdminSportsServices";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminStaffAttendance from "./pages/admin/AdminStaffAttendance";
import AdminSalaries from "./pages/admin/AdminSalaries";
import AdminApprovals from "./pages/admin/AdminApprovals";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachAttendance from "./pages/coach/CoachAttendance";
import CoachTournaments from "./pages/coach/CoachTournaments";
import CoachEquipment from "./pages/coach/CoachEquipment";
import CoachSchedules from "./pages/coach/CoachSchedules";
import CoachTrainers from "./pages/coach/CoachTrainers";
import CoachSalary from "./pages/coach/CoachSalary";
import CoachNotifications from "./pages/coach/CoachNotifications";
import CoachProfile from "./pages/coach/CoachProfile";
import CoachReports from "./pages/coach/CoachReports";

// Club workspace extras
import AdminClubProfile from "./pages/admin/AdminClubProfile";

// Public website (own shell - no links into the workspace)
import PublicSiteLayout from "./layouts/PublicSiteLayout";
import ClubsPage from "./pages/public/ClubsPage";
import ClubProfilePage from "./pages/public/ClubProfilePage";
import ForClubsPage from "./pages/public/ForClubsPage";

// Owner onboarding (email + password) and member identity
import OwnerLoginPage from "./pages/auth/OwnerLoginPage";
import SelectClubPage from "./pages/auth/SelectClubPage";
import SellSignInPage from "./pages/sell/SellSignInPage";
import SubscribeRequestPage from "./pages/sell/SubscribeRequestPage";
import SubscriptionStatusPage from "./pages/sell/SubscriptionStatusPage";

// Platform console (software owner)
import PlatformLayout from "./components/platform/PlatformLayout";
import PlatformLoginPage from "./pages/platform/PlatformLoginPage";
import PlatformOverview from "./pages/platform/PlatformOverview";
import PlatformRequests from "./pages/platform/PlatformRequests";
import PlatformClubs from "./pages/platform/PlatformClubs";
import PlatformPlans from "./pages/platform/PlatformPlans";
import PlatformRevenue from "./pages/platform/PlatformRevenue";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <Routes>

      {/* ============================================================
          PUBLIC WEBSITE
          A separate shell with no path into any club's workspace.
      ============================================================ */}
      <Route element={<PublicSiteLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:slug" element={<ClubProfilePage />} />
        <Route path="/for-clubs" element={<ForClubsPage />} />
      </Route>

      {/* ============================================================
          OWNER ONBOARDING - plain email + password
      ============================================================ */}
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/sell/login" element={<SellSignInPage />} />
      <Route path="/sell/subscribe" element={<SubscribeRequestPage />} />
      <Route path="/sell/status" element={<SubscriptionStatusPage />} />

      {/* ============================================================
          MEMBER / STAFF AUTH - plain email + password
      ============================================================ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/select-club" element={<SelectClubPage />} />

      {/* ============================================================
          PLATFORM CONSOLE - the software owner, across every club
      ============================================================ */}
      <Route path="/platform/login" element={<PlatformLoginPage />} />

      <Route element={<ProtectedRoute platformOnly />}>
        <Route path="/platform" element={<PlatformLayout />}>
          <Route index element={<PlatformOverview />} />
          <Route path="requests" element={<PlatformRequests />} />
          <Route path="clubs" element={<PlatformClubs />} />
          <Route path="plans" element={<PlatformPlans />} />
          <Route path="revenue" element={<PlatformRevenue />} />
        </Route>
      </Route>

      {/* USER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute requireClub />}>
        <Route path="/user/dashboard" element={<UserOverview />} />
        <Route path="/user/membership" element={<MyMembership />} />
        <Route path="/user/sports" element={<UserSportsEnrollment />} />
        <Route path="/user/schedules" element={<UserTrainingSchedule />} />
        <Route path="/user/performance" element={<UserPerformance />} />
        <Route path="/user/reports" element={<UserReports />} />
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
      <Route element={<ProtectedRoute adminOnly requireClub />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/club-profile" element={<AdminClubProfile />} />
        {/* Same page under the name admins look for it by. */}
        <Route path="/admin/profile" element={<AdminClubProfile />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/memberships" element={<AdminMemberships />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/coaches" element={<AdminCoaches />} />
        <Route path="/admin/teams" element={<AdminTeams />} />
        <Route path="/admin/tournaments" element={<AdminTournaments />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/equipment" element={<AdminEquipment />} />
        <Route path="/admin/reports" element={<AdminReportsAnalytics />} />
        <Route path="/admin/vouchers" element={<AdminVouchers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/fines" element={<AdminFines />} />
        <Route path="/admin/advance-payments" element={<AdminAdvancePayments />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/sports-services" element={<AdminSportsServices />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/staff-attendance" element={<AdminStaffAttendance />} />
        <Route path="/admin/salaries" element={<AdminSalaries />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
      </Route>

      {/* COACH PROTECTED ROUTES */}
      <Route element={<ProtectedRoute coachOnly requireClub />}>
        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        <Route path="/coach/attendance" element={<CoachAttendance />} />
        <Route path="/coach/tournaments" element={<CoachTournaments />} />
        <Route path="/coach/equipment" element={<CoachEquipment />} />
        <Route path="/coach/schedules" element={<CoachSchedules />} />
        <Route path="/coach/trainers" element={<CoachTrainers />} />
        <Route path="/coach/salary" element={<CoachSalary />} />
        <Route path="/coach/notifications" element={<CoachNotifications />} />
        <Route path="/coach/profile" element={<CoachProfile />} />
        <Route path="/coach/reports" element={<CoachReports />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Toaster
          position="top-right"
          containerStyle={{ top: 74, right: 12, maxWidth: "calc(100vw - 24px)" }}
          toastOptions={{
            duration: 3500,
            style: {
              background: "#18181b",
              color: "#ffffff",
              border: "1px solid #27272a",
              borderRadius: "0px",
              fontSize: "12px",
              fontWeight: "600",
              maxWidth: "calc(100vw - 32px)",
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
    </ThemeProvider>
  );
}

export default App;
