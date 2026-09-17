import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Placeholder screen while building
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
    <p className="text-xs text-slate-500 mt-1">Ready for implementation.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/sales" replace />} />

            {/* Sales Rep Routes (Your Area) */}
            <Route path="sales" element={<Placeholder title="Sales Dashboard" />} />
            <Route path="sales/leads" element={<Placeholder title="Leads Directory" />} />
            <Route path="sales/follow-up" element={<Placeholder title="Follow-up Log" />} />
            <Route path="sales/demos" element={<Placeholder title="Schedule Demo View" />} />
            <Route path="sales/batches" element={<Placeholder title="Batch Roster" />} />
            <Route path="sales/fees" element={<Placeholder title="Fees Management" />} />
            <Route path="sales/invoices" element={<Placeholder title="Invoices" />} />
            <Route path="sales/attendance" element={<Placeholder title="My Attendance" />} />

            {/* Faculty Routes (Your Friend's Area) */}
            <Route path="faculty" element={<Placeholder title="Faculty Dashboard" />} />
            <Route path="faculty/attendance" element={<Placeholder title="Faculty Attendance" />} />
            <Route path="faculty/demos" element={<Placeholder title="Assigned Demos" />} />
            <Route path="faculty/batches" element={<Placeholder title="Assigned Batches" />} />
            <Route path="faculty/students" element={<Placeholder title="Student Roster" />} />

            {/* Admin Routes */}
            <Route path="admin" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="admin/*" element={<Placeholder title="Admin Management Module" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}