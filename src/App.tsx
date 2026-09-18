import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';


// Placeholder screen for pending sub-pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 bg-white border border-[#050720]/10 rounded-2xl shadow-sm font-['Onest']">
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
            {/* Redirect root directly to Batches */}
            <Route index element={<Navigate to="/sales/batches" replace />} />

            {/* Sales Rep Routes */}
            <Route path="sales" element={<Navigate to="/sales/batches" replace />} />
            <Route path="sales/batches" element={<BatchManagementPage />} />
            <Route path="sales/leads" element={<Placeholder title="Leads Directory" />} />
            <Route path="sales/follow-up" element={<Placeholder title="Follow-up Log" />} />
            <Route path="sales/demos" element={<Placeholder title="Demo Management" />} />
            <Route path="sales/fees" element={<Placeholder title="Fees Management" />} />
            <Route path="sales/invoices" element={<Placeholder title="Invoices" />} />
            <Route path="sales/attendance" element={<Placeholder title="My Attendance" />} />

            {/* Faculty Routes */}
            <Route path="faculty" element={<Placeholder title="Faculty Dashboard" />} />
            <Route path="faculty/batches" element={<BatchManagementPage />} />
            <Route path="faculty/attendance" element={<Placeholder title="Faculty Attendance" />} />
            <Route path="faculty/demos" element={<Placeholder title="Assigned Demos" />} />


            {/* Admin Routes */}
            <Route path="admin" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="admin/batches" element={<BatchManagementPage />} />
            <Route path="admin/*" element={<Placeholder title="Admin Management Module" />} />


          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}