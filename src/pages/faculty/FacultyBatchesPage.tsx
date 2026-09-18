import React, { useState } from 'react';
import { ArrowLeft, Clock, Plus, Check } from 'lucide-react';

type ViewMode = 'list' | 'batch-details' | 'lecture-view' | 'add-lecture' | 'student-details';

interface Student {
  id: string;
  srNo: string;
  name: string;
  startDate: string;
  contact: string;
  attendanceRatio: string;
  remark: string;
  presentInLecture?: boolean;
}

interface Lecture {
  id: string;
  srNo: string;
  topic: string;
  date: string;
  hoursSpent: string;
  attendance: string;
  timeSlot: string;
  topicsCovered: string[];
  assignmentGiven: string;
}

export const FacultyBatchesPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedBatchCode, setSelectedBatchCode] = useState('MWF-JAN-2026');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // New Lecture Form State
  const [newLectureForm, setNewLectureForm] = useState({
    title: '',
    course: 'UI/UX Design',
    date: '06-01-2026',
    timeSlot: '11:00-12:00',
    topicsCovered: '',
    assignmentGiven: '',
  });

  // Sample Students
  const [students, setStudents] = useState<Student[]>([
    { id: '1', srNo: '01', name: 'Ashish Mehta', startDate: '21-12-2025', contact: '9158745870', attendanceRatio: '02/02', remark: 'Assignment done', presentInLecture: true },
    { id: '2', srNo: '02', name: 'Tanaya Junnarkar', startDate: '21-12-2025', contact: '9876543152', attendanceRatio: '02/02', remark: 'Assignment done', presentInLecture: true },
    { id: '3', srNo: '03', name: 'Aashi Shah', startDate: '21-12-2025', contact: '9876543152', attendanceRatio: '01/02', remark: 'Assignment done', presentInLecture: true },
    { id: '4', srNo: '04', name: 'Vishwajeet Pawale', startDate: '21-12-2025', contact: '8987456512', attendanceRatio: '01/02', remark: 'Assignment done', presentInLecture: true },
    { id: '5', srNo: '05', name: 'Siddhi Shah', startDate: '21-12-2025', contact: '9876543152', attendanceRatio: '01/02', remark: 'Assignment done', presentInLecture: true },
  ]);

  // Sample Lectures
  const [lectures, setLectures] = useState<Lecture[]>([
    {
      id: 'lec-1',
      srNo: '01',
      topic: 'Introduction to UI/UX Design',
      date: '02-01-2026',
      hoursSpent: '01',
      attendance: '05/05',
      timeSlot: '11:00-12:00',
      topicsCovered: [
        'Overview of User Interface (UI) and User Experience (UX) and how they differ',
        'Importance of user-centered design in digital products',
        'Real-world examples of good vs poor user experience',
      ],
      assignmentGiven: 'Study your favourite application',
    },
    {
      id: 'lec-2',
      srNo: '02',
      topic: 'Understanding of UI/UX',
      date: '21-12-2025',
      hoursSpent: '02',
      attendance: '04/05',
      timeSlot: '11:00-12:00',
      topicsCovered: ['Design heuristics and usability principles'],
      assignmentGiven: 'Wireframe one onboarding screen',
    },
  ]);

  const toggleStudentAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, presentInLecture: !s.presentInLecture } : s))
    );
  };

  const handleSaveLecture = () => {
    if (!newLectureForm.title) return;
    const presentCount = students.filter((s) => s.presentInLecture).length;
    const createdLecture: Lecture = {
      id: `lec-${Date.now()}`,
      srNo: `0${lectures.length + 1}`,
      topic: newLectureForm.title,
      date: newLectureForm.date,
      hoursSpent: '01',
      attendance: `0${presentCount}/0${students.length}`,
      timeSlot: newLectureForm.timeSlot,
      topicsCovered: newLectureForm.topicsCovered ? [newLectureForm.topicsCovered] : ['Lecture session'],
      assignmentGiven: newLectureForm.assignmentGiven || 'None',
    };
    setLectures([createdLecture, ...lectures]);
    setCurrentView('batch-details');
  };

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      {/* ─────────────────────────────────────────────────────────────────
          VIEW 1: BATCH MANAGEMENT (MAIN TABLE)
      ───────────────────────────────────────────────────────────────── */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Batch Management</h1>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Total Batches</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">05</div>
              <span className="text-[11px] text-[#050720]/40">All time</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Ongoing</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">02</div>
              <span className="text-[11px] text-[#050720]/40">Wire framing Phase</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Upcoming</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">02</div>
              <span className="text-[11px] text-[#050720]/40">Newly enrolled</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Completed</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">01</div>
              <span className="text-[11px] text-[#050720]/40">Portfolio completed</span>
            </div>
          </div>

          {/* Batches Table Card */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[#050720]/60 font-medium">Sort by:</span>
              <select className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none">
                <option>Course</option>
                <option>UI/UX Design</option>
                <option>No Code</option>
              </select>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                  <th className="pb-3">Sr. No.</th>
                  <th className="pb-3">Batch</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Student count</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {[
                  { srNo: '01', batch: 'MWF-JAN-2026', start: '21-12-2025', course: 'UI/UX Design', count: '05' },
                  { srNo: '02', batch: 'TTS-JAN-2026', start: '21-12-2025', course: 'No Code', count: '06' },
                  { srNo: '03', batch: 'WEEKEND-JAN-2026', start: '21-12-2025', course: 'UI/UX Design', count: '04' },
                ].map((row) => (
                  <tr key={row.srNo} className="hover:bg-[#FFB908]/5">
                    <td className="py-3.5 text-[#050720]/70">{row.srNo}</td>
                    <td className="py-3.5 font-medium">{row.batch}</td>
                    <td className="py-3.5 text-[#050720]/70">{row.start}</td>
                    <td className="py-3.5 text-[#050720]/70">{row.course}</td>
                    <td className="py-3.5 text-[#050720]/70">{row.count}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedBatchCode(row.batch);
                          setCurrentView('batch-details');
                        }}
                        className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VIEW 2: BATCH DETAILS (STUDENTS & PAST LECTURES)
      ───────────────────────────────────────────────────────────────── */}
      {currentView === 'batch-details' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('list')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Batch Details</h1>
          </div>

          {/* KPI Mini-Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Completed Lectures</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">02</div>
              <span className="text-[11px] text-[#050720]/40">This Week</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Hours spent</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">02</div>
              <span className="text-[11px] text-[#050720]/40">Total lecture hours</span>
            </div>
          </div>

          {/* Batch Overview Meta */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora'] mb-4">Batch Overview</h3>
            <div className="grid grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Batch</span>
                <span className="font-semibold text-[#050720]">{selectedBatchCode}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Faculty</span>
                <span className="font-semibold text-[#050720]">Poorva Pande</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">UI/UX Design</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Student Count</span>
                <span className="font-semibold text-[#050720]">05</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Start Date</span>
                <span className="font-semibold text-[#050720]">21-12-2025</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">End Date</span>
                <span className="font-semibold text-[#050720]">21-05-2026</span>
              </div>
            </div>
          </div>

          {/* Table: Student Details */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora'] mb-4">Student Details</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                  <th className="pb-3">Sr. No.</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Attendance</th>
                  <th className="pb-3">Remark</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#FFB908]/5">
                    <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                    <td className="py-3 font-medium text-[#050720]">{st.name}</td>
                    <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                    <td className="py-3 text-[#050720]/70">{st.contact}</td>
                    <td className="py-3 font-semibold text-[#10B981]">{st.attendanceRatio}</td>
                    <td className="py-3 text-[#050720]/70">{st.remark}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(st);
                          setCurrentView('student-details');
                        }}
                        className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table: Lectures List */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Lectures</h3>
              <button
                onClick={() => setCurrentView('add-lecture')}
                className="flex items-center gap-1 px-4 py-1.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add new lecture</span>
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                  <th className="pb-3">Sr. No.</th>
                  <th className="pb-3">Lecture Topic</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Hours Spent</th>
                  <th className="pb-3">Attendance</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5">
                {lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-[#FFB908]/5">
                    <td className="py-3 text-[#050720]/70">{lec.srNo}</td>
                    <td className="py-3 font-medium text-[#050720]">{lec.topic}</td>
                    <td className="py-3 text-[#050720]/70">{lec.date}</td>
                    <td className="py-3 text-[#050720]/70">{lec.hoursSpent}</td>
                    <td className="py-3 font-medium text-[#050720]">{lec.attendance}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setCurrentView('lecture-view');
                        }}
                        className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VIEW 3a: LECTURE VIEW (READ-ONLY DETAILS & ROSTER)
      ───────────────────────────────────────────────────────────────── */}
      {currentView === 'lecture-view' && selectedLecture && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#050720] font-['Sora'] leading-none">Lectures</h1>
              <span className="text-xs text-[#050720]/60">Poorva Pande</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Lecture title</span>
                <span className="font-semibold text-[#050720]">{selectedLecture.topic}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">UI/UX Design</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Date</span>
                <span className="font-semibold text-[#050720]">{selectedLecture.date}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Time Slot</span>
                <span className="font-semibold text-[#050720]">{selectedLecture.timeSlot}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Topics Covered</span>
                <ul className="list-disc list-inside space-y-1 mt-1 text-[#050720]/80">
                  {selectedLecture.topicsCovered.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Assignment Given</span>
                <span className="text-[#050720]/80 mt-1 block">{selectedLecture.assignmentGiven}</span>
              </div>
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            <div className="flex gap-12 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Total Students</span>
                <span className="font-bold text-sm text-[#050720]">05</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Present Students</span>
                <span className="font-bold text-sm text-[#050720]">05</span>
              </div>
            </div>

            <table className="w-full text-left text-xs pt-2">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                  <th className="pb-3 w-8"></th>
                  <th className="pb-3">Sr. No.</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5">
                {students.map((st) => (
                  <tr key={st.id}>
                    <td className="py-3">
                      <div className="w-4 h-4 rounded border border-[#050720]/30 flex items-center justify-center bg-[#050720] text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    </td>
                    <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                    <td className="py-3 font-medium text-[#050720]">{st.name}</td>
                    <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                    <td className="py-3 text-[#050720]/70">{st.contact}</td>
                    <td className="py-3 text-[#050720]/70">{st.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VIEW 3b: ADD NEW LECTURE (FORM + CHECKLIST ATTENDANCE)
      ───────────────────────────────────────────────────────────────── */}
      {currentView === 'add-lecture' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#050720] font-['Sora'] leading-none">Lectures</h1>
              <span className="text-xs text-[#050720]/60">Poorva Pande</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                placeholder="Lecture Topic / Title"
                value={newLectureForm.title}
                onChange={(e) => setNewLectureForm({ ...newLectureForm, title: e.target.value })}
                className="border border-[#050720]/15 rounded-lg p-3 focus:outline-none focus:border-[#FFB908]"
              />
              <input
                type="text"
                placeholder="Course"
                value={newLectureForm.course}
                disabled
                className="border border-[#050720]/15 rounded-lg p-3 bg-slate-50 text-[#050720]/60"
              />
              <input
                type="text"
                placeholder="Date (e.g. 06-01-2026)"
                value={newLectureForm.date}
                onChange={(e) => setNewLectureForm({ ...newLectureForm, date: e.target.value })}
                className="border border-[#050720]/15 rounded-lg p-3 focus:outline-none focus:border-[#FFB908]"
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Time Slot"
                  value={newLectureForm.timeSlot}
                  onChange={(e) => setNewLectureForm({ ...newLectureForm, timeSlot: e.target.value })}
                  className="w-full border border-[#050720]/15 rounded-lg p-3 pr-9 focus:outline-none focus:border-[#FFB908]"
                />
                <Clock className="w-4 h-4 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <input
                type="text"
                placeholder="Topics Covered"
                value={newLectureForm.topicsCovered}
                onChange={(e) => setNewLectureForm({ ...newLectureForm, topicsCovered: e.target.value })}
                className="border border-[#050720]/15 rounded-lg p-3 focus:outline-none focus:border-[#FFB908]"
              />
              <input
                type="text"
                placeholder="Assignment Given"
                value={newLectureForm.assignmentGiven}
                onChange={(e) => setNewLectureForm({ ...newLectureForm, assignmentGiven: e.target.value })}
                className="border border-[#050720]/15 rounded-lg p-3 focus:outline-none focus:border-[#FFB908]"
              />
            </div>
          </div>

          {/* Roll Call Checkbox Table */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            <div className="flex gap-12 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Total Students</span>
                <span className="font-bold text-sm text-[#050720]">05</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Present Students</span>
                <span className="font-bold text-sm text-[#050720]">
                  {students.filter((s) => s.presentInLecture).length < 10
                    ? `0${students.filter((s) => s.presentInLecture).length}`
                    : students.filter((s) => s.presentInLecture).length}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs pt-2">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                  <th className="pb-3 w-8"></th>
                  <th className="pb-3">Sr. No.</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Start Date</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5">
                {students.map((st) => (
                  <tr key={st.id} onClick={() => toggleStudentAttendance(st.id)} className="cursor-pointer">
                    <td className="py-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          st.presentInLecture
                            ? 'bg-[#050720] border-[#050720] text-white'
                            : 'border-[#050720]/30 bg-white'
                        }`}
                      >
                        {st.presentInLecture && <Check className="w-3 h-3" />}
                      </div>
                    </td>
                    <td className="py-3 text-[#050720]/70">{st.srNo}</td>
                    <td className="py-3 font-medium text-[#050720]">{st.name}</td>
                    <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                    <td className="py-3 text-[#050720]/70">{st.contact}</td>
                    <td className="py-3 text-[#050720]/70">{st.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="w-1/2 py-3 border border-[#050720]/30 rounded-lg text-xs font-bold text-[#050720] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLecture}
              className="w-1/2 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          VIEW 3c: STUDENT DETAILS (ATTENDANCE BARS & HISTORY)
      ───────────────────────────────────────────────────────────────── */}
      {currentView === 'student-details' && selectedStudent && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Student Details</h1>
          </div>

          {/* Student Overview */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">First Name</span>
                <span className="font-semibold text-[#050720]">{selectedStudent.name.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Last Name</span>
                <span className="font-semibold text-[#050720]">{selectedStudent.name.split(' ')[1] || 'Junnarkar'}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Batch</span>
                <span className="font-semibold text-[#050720]">{selectedBatchCode}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">UI/UX Design</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Start Date</span>
                <span className="font-semibold text-[#050720]">{selectedStudent.startDate}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Address</span>
                <span className="font-semibold text-[#050720]">Pune</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#050720]/50 block text-[11px]">Mobile</span>
                <span className="font-semibold text-[#050720]">{selectedStudent.contact}</span>
              </div>
            </div>

            {/* Editable Remark */}
            <div className="pt-2">
              <label className="text-[11px] text-[#050720]/60 block mb-1">Add remark</label>
              <input
                type="text"
                defaultValue={selectedStudent.remark}
                className="w-full border border-[#050720]/15 rounded-lg p-2.5 text-xs text-[#050720] focus:outline-none focus:border-[#FFB908]"
              />
            </div>
          </div>

          {/* Attendance Stats Cards with Progress Bars */}
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'This Month', percent: 50 },
                { label: 'Last Month', percent: 50 },
                { label: 'Average', percent: 50 },
              ].map((stat, i) => (
                <div key={i} className="border border-[#050720]/10 rounded-xl p-4 shadow-2xs">
                  <div className="text-xl font-bold text-[#050720] font-['Sora']">{stat.percent}%</div>
                  {/* Visual Bar */}
                  <div className="w-full bg-[#050720]/10 h-1.5 rounded-full my-2 overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${stat.percent}%` }}></div>
                  </div>
                  <span className="text-[11px] text-[#050720]/50">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Attendance Session Logs */}
            <div className="space-y-3 pt-4">
              <div className="border border-[#050720]/10 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <span className="font-medium text-[#050720]">Introduction to UI/UX</span>
                <div className="text-right">
                  <span className="text-[#10B981] font-semibold block text-[11px]">Present</span>
                  <span className="text-[#050720]/40 text-[10px]">02-01-2026</span>
                </div>
              </div>
              <div className="border border-[#050720]/10 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <span className="font-medium text-[#050720]">Understanding of UI/UX</span>
                <div className="text-right">
                  <span className="text-[#EF4444] font-semibold block text-[11px]">Absent</span>
                  <span className="text-[#050720]/40 text-[10px]">04-01-2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};