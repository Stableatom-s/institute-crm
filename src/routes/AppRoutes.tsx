import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// ─── Auth & Utility Pages ───
import { LoginPage } from '../pages/auth/LoginPage';
import { NotificationsPage } from '../components/common/NotificationsPage';
import { ProfilePage } from '../components/common/ProfilePage';

// ─── Admin Pages ───
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminLeadsPage } from '../pages/admin/AdminLeadsPage';
import { AdminDemosPage } from '../pages/admin/AdminDemosPage';
import { AdminBatchPage } from '../pages/admin/AdminBatchesPage';
import { AdminStudentPage } from '../pages/admin/StudentPage';
import { AdminAttendancePage } from '../pages/admin/AttendancePage';
import { AdminLeavePage } from '../pages/admin/LeavePage';
import { AdminTeamPage } from '../pages/admin/TeamPage';
import { AdminInvoicesPage } from '../pages/admin/AdminInvoicesPage';

// ─── Sales Pages ───
import { SalesDashboard } from '../pages/sales/SalesDashboard';
import { SalesLeadsPage } from '../pages/sales/SalesLeadsPage';
import { FollowUpPage } from '../pages/sales/FollowUpPage';
import { DemoManagementPage } from '../pages/sales/DemoManagementPage';
import { BatchManagementPage } from '../pages/sales/BatchManagementPage';
import { FeesManagementPage } from '../pages/sales/FeesManagementPage';
import { SalesInvoicesPage } from '../pages/sales/SalesInvoicesPage';
import { SalesAttendancePage } from '../pages/sales/SalesAttendancePage';

// ─── Faculty Pages ───
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboard';
import { FacultyBatchesPage } from '../pages/faculty/FacultyBatchesPage';
import { FacultyDemoPage } from '../pages/faculty/FacultyDemosPage';
import { FacultyStudentsPage } from '../pages/faculty/FacultyStudentsPage';
import { FacultyAttendancePage } from '../pages/faculty/FacultyAttendancePage';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const normalizedRole = user.role?.toLowerCase();
  if (normalizedRole === 'sales') return <Navigate to="/sales" replace />;
  if (normalizedRole === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/admin" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── PUBLIC AUTHENTICATION ROUTE (Without AppLayout Shell) ─── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ─── PROTECTED APPLICATION ROUTES (Inside AppLayout Shell) ─── */}
      <Route path="/" element={<AppLayout />}>
        {/* Dynamic Root */}
        <Route index element={<RootRedirect />} />

        {/* Global Notifications Page (Accessible across roles) */}
        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin/profile" element={<ProfilePage />} />
        <Route path="faculty/profile" element={<ProfilePage />} />
        <Route path="sales/profile" element={<ProfilePage />} />

        {/* ─── ADMIN ROUTES ─── */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'ADMIN']} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/leads" element={<AdminLeadsPage />} />
          <Route path="admin/demos" element={<AdminDemosPage />} />
          <Route path="admin/demo-management" element={<AdminDemosPage />} />
          <Route path="admin/batches" element={<AdminBatchPage />} />
          <Route path="admin/batch" element={<AdminBatchPage />} />
          <Route path="admin/students" element={<AdminStudentPage />} />
          <Route path="admin/student-management" element={<AdminStudentPage />} />
          <Route path="admin/attendance" element={<AdminAttendancePage />} />
          <Route path="admin/leave" element={<AdminLeavePage />} />
          <Route path="admin/team" element={<AdminTeamPage />} />
          <Route path="admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="admin/invoice" element={<AdminInvoicesPage />} />
        </Route>

        {/* ─── SALES ROUTES ─── */}
        <Route element={<ProtectedRoute allowedRoles={['sales', 'SALES', 'admin', 'ADMIN']} />}>
          <Route path="sales" element={<SalesDashboard />} />
          <Route path="sales/dashboard" element={<SalesDashboard />} />
          <Route path="sales/leads" element={<SalesLeadsPage />} />
          <Route path="sales/follow-up" element={<FollowUpPage />} />
          <Route path="sales/demos" element={<DemoManagementPage />} />
          <Route path="sales/demo-management" element={<DemoManagementPage />} />
          <Route path="sales/batches" element={<BatchManagementPage />} />
          <Route path="sales/batch" element={<BatchManagementPage />} />
          <Route path="sales/fees" element={<FeesManagementPage />} />
          <Route path="sales/fees-management" element={<FeesManagementPage />} />
          <Route path="sales/invoices" element={<SalesInvoicesPage />} />
          <Route path="sales/attendance" element={<SalesAttendancePage />} />
          <Route path="sales/my-attendance" element={<SalesAttendancePage />} />
        </Route>

        {/* ─── FACULTY ROUTES ─── */}
        <Route element={<ProtectedRoute allowedRoles={['faculty', 'FACULTY', 'admin', 'ADMIN']} />}>
          <Route path="faculty" element={<FacultyDashboardPage />} />
          <Route path="faculty/dashboard" element={<FacultyDashboardPage />} />
          <Route path="faculty/batches" element={<FacultyBatchesPage />} />
          <Route path="faculty/batch" element={<FacultyBatchesPage />} />
          <Route path="faculty/demos" element={<FacultyDemoPage />} />
          <Route path="faculty/demo-management" element={<FacultyDemoPage />} />
          <Route path="faculty/students" element={<FacultyStudentsPage />} />
          <Route path="faculty/student-management" element={<FacultyStudentsPage />} />
          <Route path="faculty/attendance" element={<FacultyAttendancePage />} />
          <Route path="faculty/my-attendance" element={<FacultyAttendancePage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};