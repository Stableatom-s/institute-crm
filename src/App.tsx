import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';


import { BatchManagementPage } from './pages/sales/BatchManagementPage';
import { DemoManagementPage } from './pages/sales/DemoManagementPage';
import { SalesLeadsPage } from './pages/sales/SalesLeadsPage';
import { FollowUpPage } from './pages/sales/FollowUpPage';
import { SalesInvoicesPage } from './pages/sales/SalesInvoicesPage';
import { FeesManagementPage } from './pages/sales/FeesManagementPage';
import { SalesAttendancePage } from './pages/sales/SalesAttendancePage';
import { SalesDashboard } from './pages/sales/SalesDashboard';



import { FacultyBatchesPage } from './pages/faculty/FacultyBatchesPage';
import { FacultyDemoPage } from './pages/faculty/FacultyDemosPage';
import { FacultyStudentsPage } from './pages/faculty/FacultyStudentsPage';
import { FacultyAttendancePage } from './pages/faculty/FacultyAttendancePage';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';

// Placeholder screen for pending sub-pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 bg-white border border-[#050720]/10 rounded-2xl shadow-xs font-['Onest']">
    <h1 className="text-xl font-bold text-[#050720] font-['Sora']">{title}</h1>
    <p className="text-xs text-[#050720]/50 mt-1">Ready for implementation.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Root default redirect */}
            <Route index element={<Navigate to="/faculty/demo-management" replace />} />

            {/* ─── Sales Rep Routes ─── */}
            <Route path="sales" element={<SalesDashboard />} />
            <Route path="sales/batches" element={<BatchManagementPage />} />
            <Route path="sales/leads" element={<SalesLeadsPage />} />
            <Route path="sales/follow-up" element={<FollowUpPage />} />
            <Route path="sales/demos" element={<DemoManagementPage />} />
            <Route path="sales/demo-management" element={<DemoManagementPage />} />
            <Route path="sales/fees" element={<FeesManagementPage />} />
            <Route path="sales/fees-management" element={<FeesManagementPage />} />
            <Route path="sales/invoices" element={<SalesInvoicesPage />} />
            <Route path="sales/attendance" element={<SalesAttendancePage />} />
            <Route path="sales/my-attendance" element={<SalesAttendancePage />} />

            {/* ─── Faculty Routes ─── */}
            <Route path="faculty" element={<FacultyDashboardPage />} />
            <Route path="faculty/dashboard" element={<FacultyDashboardPage />} />
            <Route path="faculty/batches" element={<FacultyBatchesPage />} />
            <Route path="faculty/batch" element={<FacultyBatchesPage />} />
            <Route path="faculty/attendance" element={<FacultyAttendancePage />} />
            <Route path="faculty/my-attendance" element={<Placeholder title="Faculty Attendance" />} />
            <Route path="faculty/demos" element={<FacultyDemoPage />} />
            <Route path="faculty/demo-management" element={<FacultyDemoPage />} />
            <Route path="faculty/student-management" element={<FacultyStudentsPage />} />
            <Route path="faculty/students" element={<FacultyStudentsPage />} />

            {/* ─── Admin Routes ─── */}
            <Route path="admin" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="admin/demo-management" element={<Placeholder title="Admin Demo Management" />} />
            <Route path="admin/leads" element={<Placeholder title="Admin Leads" />} />
            <Route path="admin/batches" element={<Placeholder title="Admin Batches" />} />
            <Route path="admin/batch" element={<Placeholder title="Admin Batches" />} />
            <Route path="admin/student" element={<Placeholder title="Admin Students" />} />
            <Route path="admin/attendance" element={<Placeholder title="Institute Attendance" />} />
            <Route path="admin/leave" element={<Placeholder title="Leave Management" />} />
            <Route path="admin/team" element={<Placeholder title="Team Members" />} />
            <Route path="admin/invoices" element={<Placeholder title="Admin Invoices & Collections" />} />

            {/* Catch-all 404 fallback */}
            <Route path="*" element={<Navigate to="/faculty/demo-management" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}