import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { batchService, BatchItem, BatchStudent, BatchLecture } from '../../services/batchService';

const COURSES = ['Course', 'UI/UX Design', 'No Code', 'Full-Stack', 'Portfolio'];

export const AdminBatchPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'roster' | 'batch-details' | 'student-details' | 'lecture-details'>('roster');
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<BatchStudent | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<BatchLecture | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [courseFilter, setCourseFilter] = useState('Course');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadBatches = async () => {
    try {
      setIsLoading(true);
      const data = await batchService.getAllBatches();
      setBatches(data);
      if (data.length > 0 && !selectedBatch) {
        setSelectedBatch(data[0]);
      }
    } catch (err) {
      console.error('Failed to load admin batches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const totalBatchesCount = batches.length;
  const ongoingBatches = batches.filter((b) => (b.students?.length || 0) > 0);
  const upcomingBatches = batches.filter((b) => (b.students?.length || 0) === 0);
  const completedBatches = batches.filter((b) => (b.lectures?.length || 0) > 0);

  const filteredBatches = batches.filter((b) => {
    if (courseFilter === 'Course') return true;
    return b.course.toLowerCase() === courseFilter.toLowerCase();
  });

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. MASTER BATCH MANAGEMENT ROSTER */}
      {currentView === 'roster' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Batch Management</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Total Batches</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String(totalBatchesCount).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">All time</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Ongoing</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String(ongoingBatches.length).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Active sessions</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Upcoming</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String(upcomingBatches.length).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Newly enrolled</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Completed</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String(completedBatches.length).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Lectures delivered</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 relative z-10 pt-1">
              <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[110px]"
                >
                  <span>{courseFilter}</span>
                  {isDropdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 top-9 w-40 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                    {COURSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCourseFilter(c);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 text-[#050720]"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Batch</th>
                    <th className="pb-3.5 font-semibold">Start Date</th>
                    <th className="pb-3.5 font-semibold">Course</th>
                    <th className="pb-3.5 font-semibold">Faculty</th>
                    <th className="pb-3.5 font-semibold">Student count</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {filteredBatches.map((batch, index) => (
                    <tr key={batch.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-medium">{batch.batchCode}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                      <td className="py-3.5 text-[#050720]/70">
                        {String(batch.students?.length || 0).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setCurrentView('batch-details');
                          }}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
              <span className="text-[11px]">Jump to</span>
              <input
                type="text"
                defaultValue="01"
                className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
              />
              <div className="flex items-center gap-1.5 ml-2">
                <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BATCH DETAILS VIEW */}
      {currentView === 'batch-details' && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('roster')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Batch Details</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Completed Lectures</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String(selectedBatch.lectures?.length || 0).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">This Week</span>
            </div>
            <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#050720] block">Hours spent</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-1">
                {String((selectedBatch.lectures?.length || 0) * 1).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#050720]/50 block mt-1">Total lecture hours</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Batch Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                <span className="font-semibold text-sm">{selectedBatch.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                <span className="font-semibold text-sm">
                  {String(selectedBatch.students?.length || 0).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                <span className="font-semibold text-sm">{selectedBatch.endDate || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Details</h3>
            {(!selectedBatch.students || selectedBatch.students.length === 0) ? (
              <p className="text-xs text-[#050720]/40 italic py-4">No students enrolled in this batch yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Student Name</th>
                    <th className="pb-3.5 font-semibold">Start Date</th>
                    <th className="pb-3.5 font-semibold">Contact</th>
                    <th className="pb-3.5 font-semibold">Attendance</th>
                    <th className="pb-3.5 font-semibold">Remark</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {selectedBatch.students.map((student, idx) => {
                    const fullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
                    const targetName = fullName.toLowerCase();

                    // Calculate live attendance ratio from actual batch lectures
                    const lecs = selectedBatch.lectures || [];
                    let attended = 0;
                    lecs.forEach((lec) => {
                      const match = (lec.studentsList || []).find(
                        (s: any) => (s.name || '').trim().toLowerCase() === targetName
                      );
                      if (match && (match.isPresent ?? match.present)) {
                        attended++;
                      }
                    });

                    const attRatio = lecs.length > 0 
                      ? `${String(attended).padStart(2, '0')}/${String(lecs.length).padStart(2, '0')}`
                      : (student.attendanceRatio || '00/00');

                    const isGood = lecs.length > 0 ? (attended / lecs.length >= 0.75) : true;

                    return (
                      <tr key={student.id || idx} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3.5 font-medium">{fullName}</td>
                        <td className="py-3.5 text-[#050720]/70">{student.startDate || selectedBatch.startDate}</td>
                        <td className="py-3.5 text-[#050720]/70">{student.contact}</td>
                        <td className="py-3.5">
                          <span className={`font-semibold ${isGood ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {attRatio}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#050720]/70">{student.remark || 'Regular Attendance'}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setCurrentView('student-details');
                            }}
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Lectures</h3>
            {(!selectedBatch.lectures || selectedBatch.lectures.length === 0) ? (
              <p className="text-xs text-[#050720]/40 italic py-4">No lectures recorded for this batch yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Lecture Topic</th>
                    <th className="pb-3.5 font-semibold">Date</th>
                    <th className="pb-3.5 font-semibold">Hours Spent</th>
                    <th className="pb-3.5 font-semibold">Attendance</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {selectedBatch.lectures.map((lec, idx) => {
                    const title = lec.title || lec.topic || 'Lecture Session';
                    const attText =
                      lec.attendance ||
                      `${String(lec.presentStudents || 0).padStart(2, '0')}/${String(
                        lec.totalStudents || selectedBatch.students?.length || 0
                      ).padStart(2, '0')}`;

                    return (
                      <tr key={lec.id || idx} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3.5 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3.5 font-medium">{title}</td>
                        <td className="py-3.5 text-[#050720]/70">{lec.date}</td>
                        <td className="py-3.5 text-[#050720]/70">{lec.hoursSpent || '01'}</td>
                        <td className="py-3.5 text-[#050720]/70 font-semibold">{attText}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedLecture(lec);
                              setCurrentView('lecture-details');
                            }}
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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

      {/* 3. STUDENT DETAILS DRILLDOWN VIEW */}
      {currentView === 'student-details' && selectedStudent && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('batch-details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Student Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold text-sm">
                  {selectedStudent.firstName || selectedStudent.name?.split(' ')[0] || 'Student'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">
                  {selectedStudent.lastName || selectedStudent.name?.split(' ').slice(1).join(' ') || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedStudent.startDate || selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Address</span>
                <span className="font-semibold text-sm">Pune</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold text-sm">{selectedStudent.contact}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Remark</span>
                <span className="font-semibold text-sm">{selectedStudent.remark || 'Regular Attendance'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            
            {(() => {
              const studentFullName = (
                selectedStudent.name || 
                `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`
              ).trim().toLowerCase();

              const lecs = selectedBatch.lectures || [];
              let attendedCount = 0;
              const logs = lecs.map((lec, idx) => {
                const matchedRecord = (lec.studentsList || []).find((sl: any) => 
                  (sl.name || '').trim().toLowerCase() === studentFullName
                );
                // Strict check: if no explicit record or false, student is Absent
                const isStudentPresent = matchedRecord 
                  ? Boolean(matchedRecord.isPresent ?? matchedRecord.present) 
                  : false;

                if (isStudentPresent) attendedCount++;

                return {
                  id: lec.id || `lec-${idx}`,
                  topic: lec.lectureTopic || lec.title || lec.topic || 'Lecture Session',
                  date: lec.date,
                  status: isStudentPresent ? 'Present' : 'Absent',
                };
              });

              const dynamicPercent = lecs.length > 0 ? Math.round((attendedCount / lecs.length) * 100) : 0;

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'This Month', percent: dynamicPercent },
                      { label: 'Last Month', percent: dynamicPercent },
                      { label: 'Average', percent: dynamicPercent },
                    ].map((stat, i) => (
                      <div key={i} className="border border-[#050720]/10 rounded-xl p-5 text-center flex flex-col items-center">
                        <span className="text-xl font-bold font-['Sora']">{stat.percent}%</span>
                        <div className="w-32 h-1.5 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              stat.percent >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                            }`} 
                            style={{ width: `${stat.percent}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-[#050720]/50 mt-2 font-medium">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2">
                    {logs.length === 0 ? (
                      <p className="text-xs text-[#050720]/40 italic py-2">No lecture attendance logs yet.</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="border border-[#050720]/10 rounded-xl px-5 py-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#050720]">{log.topic}</span>
                          <div className="text-right">
                            <span className={`text-xs font-semibold block ${
                              log.status === 'Present' ? 'text-[#10B981]' : 'text-[#EF4444]'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-[10px] text-[#050720]/50 block mt-0.5">{log.date}</span>
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
      
      {/* 4. LECTURE DETAILS VIEW */}
      {currentView === 'lecture-details' && selectedLecture && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('batch-details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Lectures</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Lecture Title</span>
                <span className="font-semibold text-sm">
                  {selectedLecture.title || selectedLecture.topic || 'Lecture Session'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Date</span>
                <span className="font-semibold text-sm">{selectedLecture.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Time Slot</span>
                <span className="font-semibold text-sm">{selectedLecture.timeSlot || '11:00-12:00'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Topics Covered</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#050720]/90">
                  {(selectedLecture.topics || selectedLecture.topicsCovered || ['Lecture session overview']).map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block mb-1">Assignment Given</span>
                <p className="text-xs text-[#050720]/90">
                  {selectedLecture.assignment || selectedLecture.assignmentGiven || 'Study your favourite application'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
            <div className="flex gap-8 text-xs font-semibold pb-2">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Total Students</span>
                <span className="text-sm">
                  {String(selectedBatch.students?.length || 0).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Attendance Ratio</span>
                <span className="text-sm">
                  {selectedLecture.attendance ||
                    `${String(selectedLecture.presentStudents || 0).padStart(2, '0')}/${String(
                      selectedBatch.students?.length || 0
                    ).padStart(2, '0')}`}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold font-['Sora'] pt-2">Student Details</h4>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold w-12"></th>
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Student Name</th>
                  <th className="pb-3.5 font-semibold">Start Date</th>
                  <th className="pb-3.5 font-semibold">Contact</th>
                  <th className="pb-3.5 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {(selectedBatch.students || []).map((st, idx) => {
                  const studentName = (st.name || `${st.firstName || ''} ${st.lastName || ''}`).trim().toLowerCase();
                  const match = (selectedLecture.studentsList || []).find(
                    (sl: any) => (sl.name || '').trim().toLowerCase() === studentName
                  );
                  const isPresent = match ? Boolean(match.isPresent ?? match.present) : false;

                  return (
                    <tr key={st.id || idx} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isPresent ? 'bg-[#050720] text-white' : 'border-[#050720]/30 bg-white'
                        }`}>
                          {isPresent && <Check className="w-3 h-3" />}
                        </div>
                      </td>
                      <td className="py-3.5 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 font-medium">{st.name || `${st.firstName || ''} ${st.lastName || ''}`}</td>
                      <td className="py-3.5 text-[#050720]/70">{st.startDate || selectedBatch.startDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{st.contact}</td>
                      <td className="py-3.5 text-[#050720]/70">{st.remark || 'Regular'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};