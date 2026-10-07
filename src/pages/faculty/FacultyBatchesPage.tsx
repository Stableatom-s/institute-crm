import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { batchService, BatchItem } from '../../services/batchService';

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
  email?: string;
  course?: string;
  batchCode?: string;
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

interface RouteState {
  openStudentDetail?: boolean;
  activeTab?: string;
  from?: 'students' | 'batches';
  batchCode?: string;
  student?: {
    id: string;
    srNo?: string;
    name: string;
    startDate: string;
    contact: string;
    attendance?: string;
    attendanceRatio?: string;
    remark: string;
    course?: string;
    batchCode?: string;
    email?: string;
  };
}

export const FacultyBatchesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state as RouteState | null;

  const auth = useAuth() as any;
  const currentUserName = auth?.user?.name || 'Poorva Pande';

  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [navOrigin, setNavOrigin] = useState<'students' | 'batches'>('batches');
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [courseFilter, setCourseFilter] = useState('All');

  const [newLectureForm, setNewLectureForm] = useState({
    title: '',
    course: '',
    date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    timeSlot: '11:00 - 12:00',
    topicsCovered: '',
    assignmentGiven: '',
  });

  const [rollCallStudents, setRollCallStudents] = useState<Student[]>([]);

  const loadBatches = async () => {
    try {
      setIsLoading(true);
      const allBatches = await batchService.getAllBatches();

      const facultyBatches = allBatches.filter(
        (b) =>
          b.faculty.toLowerCase().includes(currentUserName.toLowerCase()) ||
          currentUserName.toLowerCase().includes(b.faculty.toLowerCase())
      );

      const targetBatches = facultyBatches.length > 0 ? facultyBatches : allBatches;
      setBatches(targetBatches);

      if (targetBatches.length > 0 && !selectedBatch) {
        setSelectedBatch(targetBatches[0]);
      }
    } catch (err) {
      console.error('Failed to load faculty batches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [currentUserName]);

  useEffect(() => {
    if (stateData?.student) {
      const incoming = stateData.student;
      setSelectedStudent({
        id: incoming.id,
        srNo: incoming.srNo || '01',
        name: incoming.name,
        startDate: incoming.startDate,
        contact: incoming.contact,
        attendanceRatio: incoming.attendanceRatio || incoming.attendance || '00/00',
        remark: incoming.remark || 'Active',
        email: incoming.email,
        course: incoming.course,
        batchCode: incoming.batchCode,
      });

      if (incoming.batchCode && batches.length > 0) {
        const found = batches.find((b) => b.batchCode === incoming.batchCode);
        if (found) setSelectedBatch(found);
      }
      setNavOrigin(stateData.from || 'batches');
      setCurrentView('student-details');
    }
  }, [stateData, batches]);

  useEffect(() => {
    if (selectedBatch) {
      const list: Student[] = (selectedBatch.students || []).map((st: any, idx: number) => ({
        id: st.id || st._id || `st-${idx}`,
        srNo: String(idx + 1).padStart(2, '0'),
        name: st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        startDate: st.startDate || selectedBatch.startDate,
        contact: st.contact || '—',
        attendanceRatio: st.attendance || st.attendanceRatio || '00/00',
        remark: st.remark || 'Active',
        presentInLecture: true,
        email: st.email,
        course: selectedBatch.course,
        batchCode: selectedBatch.batchCode,
      }));
      setRollCallStudents(list);
      setNewLectureForm((prev) => ({
        ...prev,
        course: selectedBatch.course,
      }));
    }
  }, [selectedBatch]);

  const handleBackFromStudentDetails = () => {
    if (navOrigin === 'students') {
      navigate('/faculty/student-management');
    } else {
      setCurrentView('batch-details');
    }
  };

  const toggleStudentAttendance = (studentId: string) => {
    setRollCallStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, presentInLecture: !s.presentInLecture } : s))
    );
  };

  const handleSaveLecture = async () => {
    if (!selectedBatch) return;
    if (!newLectureForm.title.trim()) {
      alert('Please enter a lecture title/topic.');
      return;
    }

    const presentCount = rollCallStudents.filter((s) => s.presentInLecture).length;
    const totalCount = rollCallStudents.length;

    const payload = {
      title: newLectureForm.title.trim(),
      lectureTopic: newLectureForm.title.trim(),
      date: newLectureForm.date,
      timeSlot: newLectureForm.timeSlot,
      course: newLectureForm.course || selectedBatch.course,
      topicsCovered: newLectureForm.topicsCovered ? [newLectureForm.topicsCovered] : ['Lecture session'],
      assignmentGiven: newLectureForm.assignmentGiven || 'None',
      totalStudents: totalCount,
      presentStudents: presentCount,
      studentsList: rollCallStudents.map((s) => ({
        name: s.name,
        contact: s.contact,
        startDate: s.startDate,
        isPresent: s.presentInLecture,
        present: s.presentInLecture,
      })),
    };

    try {
      const updated = await batchService.addLectureToBatch(selectedBatch.id, payload);
      setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setSelectedBatch(updated);
      setNewLectureForm({
        title: '',
        course: selectedBatch.course,
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        timeSlot: '11:00 - 12:00',
        topicsCovered: '',
        assignmentGiven: '',
      });
      alert('Lecture recorded and attendance updated successfully!');
      setCurrentView('batch-details');
    } catch (err) {
      console.error('Failed to save lecture:', err);
      alert('Failed to save lecture to server.');
    }
  };

  const totalBatchesCount = batches.length;
  const ongoingBatches = batches.filter((b) => (b.students?.length || 0) > 0);
  const upcomingBatches = batches.filter((b) => (b.students?.length || 0) === 0);
  const totalLecturesDelivered = batches.reduce((acc, b) => acc + (b.lectures?.length || 0), 0);

  const filteredBatches = courseFilter === 'All'
    ? batches
    : batches.filter((b) => b.course.toLowerCase() === courseFilter.toLowerCase());

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      {/* VIEW 1: BATCH MANAGEMENT LIST */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Batch Management</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Total Batches</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String(totalBatchesCount).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">All time</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Ongoing</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String(ongoingBatches.length).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">Active sessions</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Upcoming</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String(upcomingBatches.length).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">Newly enrolled</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Completed</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String(totalLecturesDelivered).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">Lectures delivered</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[#050720]/60 font-medium">Sort by:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none"
              >
                <option value="All">All Courses</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="No Code">No Code</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="Portfolio">Portfolio</option>
              </select>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading batches from database...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No active batches found.
              </div>
            ) : (
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
                  {filteredBatches.map((row, index) => (
                    <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 font-medium">{row.batchCode}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.startDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.course}</td>
                      <td className="py-3.5 text-[#050720]/70">{String(row.students?.length || 0).padStart(2, '0')}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatch(row);
                            setNavOrigin('batches');
                            setCurrentView('batch-details');
                          }}
                          className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BATCH DETAILS */}
      {currentView === 'batch-details' && selectedBatch && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('list')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Batch Details</h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Completed Lectures</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String(selectedBatch.lectures?.length || 0).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">Lectures logged</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-xs font-semibold text-[#050720]/80">Hours spent</span>
              <div className="text-2xl font-extrabold text-[#050720] font-['Sora'] mt-1">
                {String((selectedBatch.lectures?.length || 0) * 1).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-[#050720]/40">Total lecture hours</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora'] mb-4">Batch Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Batch</span>
                <span className="font-semibold text-[#050720]">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Faculty</span>
                <span className="font-semibold text-[#050720]">{selectedBatch.faculty}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Student Count</span>
                <span className="font-semibold text-[#050720]">
                  {String(selectedBatch.students?.length || 0).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Start Date</span>
                <span className="font-semibold text-[#050720]">{selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">End Date</span>
                <span className="font-semibold text-[#050720]">{selectedBatch.endDate || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora'] mb-4">Student Details</h3>
            {(!selectedBatch.students || selectedBatch.students.length === 0) ? (
              <p className="text-xs text-[#050720]/40 italic py-4">No students enrolled in this batch yet.</p>
            ) : (
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
                  {selectedBatch.students.map((st: any, idx: number) => {
                    const displayName =
                      st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
                    const targetName = displayName.toLowerCase();

                    // Derive attendance ratio dynamically
                    const lecs = selectedBatch.lectures || [];
                    let attended = 0;
                    lecs.forEach((lec) => {
                      const match = (lec.studentsList || []).find(
                        (s: any) => (s.name || '').trim().toLowerCase() === targetName
                      );
                      if (match && (match.isPresent ?? match.present)) attended++;
                    });

                    const attRatio = lecs.length > 0
                      ? `${String(attended).padStart(2, '0')}/${String(lecs.length).padStart(2, '0')}`
                      : (st.attendanceRatio || '00/00');
                    const isGood = lecs.length > 0 ? (attended / lecs.length >= 0.75) : true;

                    return (
                      <tr key={idx} className="hover:bg-[#FFB908]/5">
                        <td className="py-3 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3 font-medium text-[#050720]">{displayName}</td>
                        <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                        <td className="py-3 text-[#050720]/70">{st.contact}</td>
                        <td className="py-3 font-semibold">
                          <span className={isGood ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                            {attRatio}
                          </span>
                        </td>
                        <td className="py-3 text-[#050720]/70">{st.remark || 'Active'}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudent({
                                id: st.id || st._id || `st-${idx}`,
                                srNo: String(idx + 1).padStart(2, '0'),
                                name: displayName,
                                startDate: st.startDate,
                                contact: st.contact,
                                attendanceRatio: attRatio,
                                remark: st.remark || 'Active',
                                course: selectedBatch.course,
                                batchCode: selectedBatch.batchCode,
                              });
                              setNavOrigin('batches');
                              setCurrentView('student-details');
                            }}
                            className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Lectures</h3>
              <button
                onClick={() => setCurrentView('add-lecture')}
                className="flex items-center gap-1 px-4 py-1.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add new lecture</span>
              </button>
            </div>

            {(!selectedBatch.lectures || selectedBatch.lectures.length === 0) ? (
              <p className="text-xs text-[#050720]/40 italic py-4">No lectures logged for this batch yet.</p>
            ) : (
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
                  {selectedBatch.lectures.map((lec: any, idx: number) => {
                    const title = lec.title || lec.topic || 'Lecture Session';
                    const attText =
                      lec.attendance ||
                      `${String(lec.presentStudents || 0).padStart(2, '0')}/${String(
                        lec.totalStudents || selectedBatch.students?.length || 0
                      ).padStart(2, '0')}`;

                    return (
                      <tr key={lec.id || idx} className="hover:bg-[#FFB908]/5">
                        <td className="py-3 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3 font-medium text-[#050720]">{title}</td>
                        <td className="py-3 text-[#050720]/70">{lec.date}</td>
                        <td className="py-3 text-[#050720]/70">{lec.hoursSpent || '01'}</td>
                        <td className="py-3 font-medium text-[#050720]">{attText}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedLecture({
                                id: lec.id || `lec-${idx}`,
                                srNo: String(idx + 1).padStart(2, '0'),
                                topic: title,
                                date: lec.date,
                                hoursSpent: lec.hoursSpent || '01',
                                attendance: attText,
                                timeSlot: lec.timeSlot || '11:00 - 12:00',
                                topicsCovered: lec.topics || lec.topicsCovered || ['Lecture overview'],
                                assignmentGiven: lec.assignment || lec.assignmentGiven || 'None',
                              });
                              setCurrentView('lecture-view');
                            }}
                            className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3a: LECTURE VIEW */}
      {currentView === 'lecture-view' && selectedLecture && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#050720] font-['Sora'] leading-none">Lectures</h1>
              <span className="text-xs text-[#050720]/60">{selectedBatch?.faculty}</span>
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
                <span className="font-semibold text-[#050720]">{selectedBatch?.course}</span>
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

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            <div className="flex gap-12 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Total Students</span>
                <span className="font-bold text-sm text-[#050720]">
                  {String(selectedBatch?.students?.length || 0).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Attendance Ratio</span>
                <span className="font-bold text-sm text-[#050720]">
                  {selectedLecture.attendance}
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
                {(selectedBatch?.students || []).map((st: any, idx: number) => {
                  const displayName =
                    st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
                  const match = (selectedBatch?.lectures?.find(l => (l.id || l.title) === selectedLecture.id)?.studentsList || []).find(
                    (sl: any) => (sl.name || '').trim().toLowerCase() === displayName.toLowerCase()
                  );
                  const isPresent = match ? Boolean(match.isPresent ?? match.present) : false;

                  return (
                    <tr key={idx}>
                      <td className="py-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isPresent ? 'bg-[#050720] border-[#050720] text-white' : 'border-[#050720]/30 bg-white'
                        }`}>
                          {isPresent && <Check className="w-3 h-3" />}
                        </div>
                      </td>
                      <td className="py-3 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3 font-medium text-[#050720]">{displayName}</td>
                      <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                      <td className="py-3 text-[#050720]/70">{st.contact}</td>
                      <td className="py-3 text-[#050720]/70">{st.remark || 'Active'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3b: ADD NEW LECTURE */}
      {currentView === 'add-lecture' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#050720] font-['Sora'] leading-none">Lectures</h1>
              <span className="text-xs text-[#050720]/60">{selectedBatch?.faculty}</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <input
                type="text"
                placeholder="Lecture Topic / Title*"
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

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            <div className="flex gap-12 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Total Students</span>
                <span className="font-bold text-sm text-[#050720]">
                  {String(rollCallStudents.length).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Present Students</span>
                <span className="font-bold text-sm text-[#050720]">
                  {String(rollCallStudents.filter((s) => s.presentInLecture).length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {rollCallStudents.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic py-4">
                No students enrolled in this batch to record attendance.
              </p>
            ) : (
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
                  {rollCallStudents.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => toggleStudentAttendance(st.id)}
                      className="cursor-pointer hover:bg-[#FFB908]/5"
                    >
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
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('batch-details')}
              className="w-1/2 py-3 border border-[#050720]/30 rounded-lg text-xs font-bold text-[#050720] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLecture}
              className="w-1/2 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3c: STUDENT DETAILS (DYNAMIC LOGS & METRICS) */}
      {currentView === 'student-details' && selectedStudent && selectedBatch && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackFromStudentDetails}
              className="p-1 rounded hover:bg-slate-100 text-[#050720] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Student Details</h1>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">First Name</span>
                <span className="font-semibold text-[#050720]">{selectedStudent.name.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Last Name</span>
                <span className="font-semibold text-[#050720]">
                  {selectedStudent.name.split(' ').slice(1).join(' ') || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Batch</span>
                <span className="font-semibold text-[#050720]">
                  {selectedStudent.batchCode || selectedBatch.batchCode}
                </span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">
                  {selectedStudent.course || selectedBatch.course}
                </span>
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

            <div className="pt-2">
              <label className="text-[11px] text-[#050720]/60 block mb-1">Add remark</label>
              <input
                type="text"
                defaultValue={selectedStudent.remark}
                className="w-full border border-[#050720]/15 rounded-lg p-2.5 text-xs text-[#050720] focus:outline-none focus:border-[#FFB908]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Attendance</h3>
            {(() => {
              const studentName = selectedStudent.name.trim().toLowerCase();
              const lecs = selectedBatch.lectures || [];
              let attended = 0;

              const logs = lecs.map((lec, idx) => {
                const match = (lec.studentsList || []).find(
                  (sl: any) => (sl.name || '').trim().toLowerCase() === studentName
                );
                const isPresent = match ? Boolean(match.isPresent ?? match.present) : false;
                if (isPresent) attended++;

                return {
                  id: lec.id || `lec-${idx}`,
                  title: lec.title || lec.topic || 'Lecture Session',
                  date: lec.date,
                  status: isPresent ? 'Present' : 'Absent',
                };
              });

              const dynamicPercent = lecs.length > 0 ? Math.round((attended / lecs.length) * 100) : 0;

              return (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'This Month', percent: dynamicPercent },
                      { label: 'Last Month', percent: dynamicPercent },
                      { label: 'Average', percent: dynamicPercent },
                    ].map((stat, i) => (
                      <div key={i} className="border border-[#050720]/10 rounded-xl p-4 shadow-2xs">
                        <div className="text-xl font-bold text-[#050720] font-['Sora']">{stat.percent}%</div>
                        <div className="w-full bg-[#050720]/10 h-1.5 rounded-full my-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              stat.percent >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                            }`}
                            style={{ width: `${stat.percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#050720]/50">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    {logs.length === 0 ? (
                      <p className="text-xs text-[#050720]/40 italic">No lecture attendance logs yet.</p>
                    ) : (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className="border border-[#050720]/10 rounded-xl p-3.5 flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-[#050720]">{log.title}</span>
                          <div className="text-right">
                            <span className={`font-semibold block text-[11px] ${
                              log.status === 'Present' ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-[#050720]/40 text-[10px]">{log.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};