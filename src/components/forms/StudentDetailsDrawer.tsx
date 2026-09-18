import React, { useState } from 'react';
import { X, CalendarCheck, AlertCircle } from 'lucide-react';

interface StudentData {
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  attendance: string;
  isRegular: boolean;
  remark: string;
  course: string;
}

interface StudentDetailsDrawerProps {
  isOpen: boolean;
  student: StudentData | null;
  onClose: () => void;
  onUpdateAttendance: (studentName: string, newAttended: number, remark: string) => void;
}

export const StudentDetailsDrawer: React.FC<StudentDetailsDrawerProps> = ({
  isOpen,
  student,
  onClose,
  onUpdateAttendance,
}) => {
  if (!isOpen || !student) return null;

  const [attended, total] = student.attendance.split('/').map((n) => parseInt(n, 10));
  const [attendedCount, setAttendedCount] = useState(attended);
  const [remarkText, setRemarkText] = useState(student.remark);

  const handleSave = () => {
    onUpdateAttendance(student.name, attendedCount, remarkText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{student.contact}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academic Info */}
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Course Track:</span>
                <span className="font-semibold text-slate-900">{student.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-900">{student.startDate}</span>
              </div>
            </div>

            {/* Attendance Marking Control */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-amber-500" /> Mark Session Attendance
              </label>
              
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white">
                <span className="text-xs font-medium text-slate-600">Sessions Completed:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendedCount((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    0{attendedCount} / 0{total}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttendedCount((prev) => Math.min(total, prev + 1))}
                    className="w-7 h-7 rounded bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Mentor Remark */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Attendance Remark
              </label>
              <select
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="Regular Attendance">Regular Attendance</option>
                <option value="Irregular Attendance">Irregular Attendance</option>
                <option value="Leave Approved">Leave Approved</option>
                <option value="Critical Absence">Critical Absence</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#FBBF24] hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};