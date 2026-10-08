import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Search
} from 'lucide-react';
import { batchService, BatchItem, BatchStudent, BatchLecture } from '../../services/batchService';
import { leadService } from '../../services/leadService';

const COURSE_OPTIONS = ['All', 'UI/UX Design', 'No Code', 'Full Stack', 'Portfolio', 'React Native', 'React'];

export const BatchManagementPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'create' | 'add-student' | 'student-detail' | 'lecture-view'>('list');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<BatchStudent | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<BatchLecture | null>(null);

  const [dynamicFaculties, setDynamicFaculties] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<BatchStudent[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [formData, setFormData] = useState({
    batchName: '',
    faculty: '',
    startDate: '',
    endDate: '',
    timeSlot: '',
    course: 'UI/UX Design',
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [checkedStudents, setCheckedStudents] = useState<BatchStudent[]>([]);

  // 1. Fetch dynamic faculty members from live Team collection
  const loadFaculties = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch('http://localhost:5000/api/team', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const teamData = await res.json();
        const faculties = teamData
          .filter((m: any) => {
            const role = (m.role || m.department || '').toLowerCase();
            return role === 'faculty' || role === 'instructor';
          })
          .map((m: any) => m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim())
          .filter((name: string) => Boolean(name));

        if (faculties.length > 0) {
          setDynamicFaculties(Array.from(new Set(faculties)));
        } else {
          setDynamicFaculties(['Poorva Pande', 'Tanmay Kalbhor']);
        }
      }
    } catch (err) {
      console.error('Failed to load faculties:', err);
      setDynamicFaculties(['Poorva Pande', 'Tanmay Kalbhor']);
    }
  };

  const loadBatches = async () => {
    try {
      setIsLoading(true);
      const data = await batchService.getAllBatches();
      setBatches(data);
      if (data.length > 0 && !selectedBatch) {
        setSelectedBatch(data[0]);
      }
    } catch (err) {
      console.error('Failed to load batches from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrolledStudents = async () => {
    try {
      const allLeads = await leadService.getAllLeads();
      const enrolled = allLeads
        .filter((l) => l.status === 'Enrolled' || l.status === 'Interested')
        .map((l, idx) => {
          const fullName = `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Student';
          return {
            id: l.id,
            srNo: String(idx + 1).padStart(2, '0'),
            name: fullName,
            firstName: l.firstName || '',
            lastName: l.lastName || '',
            startDate: l.enquiryDate || new Date().toISOString().split('T')[0],
            contact: l.contactNo || '',
            attendance: '00/00',
            remark: l.remark || 'Active student',
            fees: l.finalFees ? `₹${l.finalFees} Paid` : '₹35,000 Paid',
          };
        });
      setAvailableStudents(enrolled);
    } catch (err) {
      console.error('Failed to load students for batch:', err);
    }
  };

  useEffect(() => {
    loadBatches();
    loadFaculties();
    loadEnrolledStudents();
  }, []);

  const filteredBatches = selectedCourseFilter === 'All'
    ? batches
    : batches.filter((b) => b.course.toLowerCase() === selectedCourseFilter.toLowerCase());

  const toggleStudentCheck = (student: BatchStudent) => {
    setCheckedStudents((prev) =>
      prev.some((s) => s.contact === student.contact)
        ? prev.filter((s) => s.contact !== student.contact)
        : [...prev, student]
    );
  };

  const handleFinalCreateBatch = async () => {
    if (!formData.batchName || !formData.faculty) {
      alert('Please enter batch name and assigned faculty.');
      return;
    }

    const formattedCode = formData.batchName.includes('-')
      ? formData.batchName
      : `B-${String(formData.batchName).padStart(2, '0')}`;

    const newSrNo = String(batches.length + 1).padStart(2, '0');

    const newEntry: Partial<BatchItem> & { srNo: string; phase?: string } = {
      srNo: newSrNo,
      batchCode: formattedCode,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || '',
      course: formData.course,
      faculty: formData.faculty,
      studentCount: 0,
      timeSlot: formData.timeSlot || '11:00 - 12:00',
      phase: 'Active',
      students: [],
      lectures: [],
    };
    try {
      setIsSubmitting(true);
      const created = await batchService.createBatch(newEntry as any);
      setBatches([created, ...batches]);
      setSelectedBatch(created);
      setShowConfirmModal(false);
      setFormData({
        batchName: '',
        faculty: '',
        startDate: '',
        endDate: '',
        timeSlot: '',
        course: 'UI/UX Design',
      });
      setCurrentView('details');
      alert(`Batch ${created.batchCode} created successfully!`);
    } catch (err: any) {
      console.error('Failed to create batch:', err);
      alert(`Failed to save batch: ${err.message || 'Server error. Make sure batch name is unique.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAddStudents = async () => {
    if (!selectedBatch || checkedStudents.length === 0) {
      setCurrentView('details');
      return;
    }

    try {
      const updated = await batchService.addStudentsToBatch(selectedBatch.id, checkedStudents);
      setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setSelectedBatch(updated);
      setCheckedStudents([]);
      setCurrentView('details');
    } catch (err) {
      console.error('Failed to add students to batch:', err);
      alert('Failed to add students to batch on database.');
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-12">
      {/* 1. BATCH LIST VIEW */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Batch Management</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Total Batches</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(batches.length).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">All time</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Ongoing</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(batches.filter(b => (b.students?.length || 0) > 0).length).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Active sessions</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Upcoming</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(batches.filter(b => (b.students?.length || 0) === 0).length).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Enrolling students</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold text-[#050720] block">Total Students</span>
              <span className="text-3xl font-extrabold font-['Sora'] mt-1 block">
                {String(batches.reduce((acc, b) => acc + (b.students?.length || 0), 0)).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Across all batches</span>
            </div>
          </div>

          <div className="flex justify-between items-center relative z-10 pt-2">
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#050720]/70 font-medium">Sort by:</span>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-medium min-w-[130px] cursor-pointer"
                >
                  <span>{selectedCourseFilter === 'All' ? 'Course' : selectedCourseFilter}</span>
                  {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isFilterOpen && (
                <div className="absolute left-14 top-9 w-44 bg-white border border-[#050720]/15 rounded-lg shadow-lg py-1 z-20">
                  {COURSE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCourseFilter(c);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#FFB908]/15 transition-colors cursor-pointer ${
                        selectedCourseFilter === c ? 'font-bold text-[#050720]' : 'text-[#050720]/80'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setFormData({ batchName: '', faculty: '', startDate: '', endDate: '', timeSlot: '', course: 'UI/UX Design' });
                setCurrentView('create');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Batch</span>
            </button>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading batches from database...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No batches found.
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
                      <td className="py-3.5 text-[#050720]/70">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-3.5 font-medium">{batch.batchCode}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                      <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                      <td className="py-3.5 text-[#050720]/70">{String(batch.students?.length || 0).padStart(2, '0')}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatch(batch);
                            setCurrentView('details');
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
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE BATCH INPUT FORM */}
      {currentView === 'create' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Create batch</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Batch Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Batch name* (e.g. 01, B-01, WD-01)"
                value={formData.batchName}
                onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />

              {/* Dynamic Faculty Dropdown */}
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] cursor-pointer"
              >
                <option value="">Faculty*</option>
                {dynamicFaculties.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Time Slot* (e.g. 11:00 - 12:00)"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] pr-10"
                />
                <Clock className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] cursor-pointer"
              >
                {COURSE_OPTIONS.filter(c => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              <button
                onClick={() => setCurrentView('list')}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.batchName || !formData.faculty) {
                    alert('Please enter batch name and faculty*');
                    return;
                  }
                  setShowConfirmModal(true);
                }}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2B. CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-xl">
            <div>
              <h2 className="text-lg font-bold font-['Sora']">Create Batch</h2>
              <p className="text-xs text-[#050720]/60 mt-1">Please review the information before continuing.</p>
            </div>

            <div className="bg-white border border-[#050720]/15 rounded-xl p-5 text-left space-y-4">
              <h4 className="text-xs font-bold font-['Sora']">Batch Overview</h4>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                  <span className="font-semibold">{formData.batchName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                  <span className="font-semibold">{formData.faculty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                  <span className="font-semibold">{formData.startDate || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                  <span className="font-semibold">{formData.endDate || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Course</span>
                  <span className="font-semibold">{formData.course}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                  <span className="font-semibold">00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Make changes
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalCreateBatch}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BATCH DETAILS VIEW */}
      {currentView === 'details' && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Batch Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Batch Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Batch</span>
                <span className="font-semibold text-sm">{selectedBatch.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Faculty</span>
                <span className="font-semibold text-sm">{selectedBatch.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Start Date</span>
                <span className="font-semibold text-sm">{selectedBatch.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">End Date</span>
                <span className="font-semibold text-sm">{selectedBatch.endDate || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedBatch.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Student Count</span>
                <span className="font-semibold text-sm">{String(selectedBatch.students?.length || 0).padStart(2, '0')}</span>
              </div>
            </div>

            {(selectedBatch.students?.length || 0) === 0 && (
              <div className="pt-4 border-t border-[#050720]/10">
                <button
                  onClick={() => setCurrentView('add-student')}
                  className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>
            )}
          </div>

          {(selectedBatch.students?.length || 0) > 0 && (
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-['Sora']">Student Details</h3>
                <button
                  onClick={() => setCurrentView('add-student')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
              </div>

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
                  {selectedBatch.students.map((st, idx) => {
                    const fullName = st.name || `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
                    const targetName = fullName.toLowerCase();

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
                      : (st.attendance || '00/00');
                    const isGood = lecs.length > 0 ? (attended / lecs.length >= 0.75) : true;

                    return (
                      <tr key={idx} className="hover:bg-[#FFB908]/5 transition-colors">
                        <td className="py-3 text-[#050720]/70">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3 font-medium">{fullName}</td>
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
                              setSelectedStudent(st);
                              setCurrentView('student-detail');
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
            </div>
          )}

          {(selectedBatch.lectures?.length || 0) > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-['Sora']">Lectures</h3>
              <div className="space-y-3">
                {selectedBatch.lectures.map((lec) => (
                  <div key={lec.id} className="bg-white border border-[#050720]/10 rounded-xl p-5 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold font-['Sora']">{lec.title}</h4>
                      <span className="text-[11px] text-[#050720]/50">{lec.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setCurrentView('lecture-view');
                        }}
                        className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <span className="text-[10px] text-[#10B981] font-semibold">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ADD STUDENT TO BATCH */}
      {currentView === 'add-student' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Add student</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search student by name or contact"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 pr-10 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
              />
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div>
              <h4 className="text-xs font-bold font-['Sora'] mb-3">Enrolled Students Ready for Assignment</h4>
              {availableStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#050720]/50">
                  No enrolled students found. Add leads in the Leads section first.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                      <th className="pb-3.5 font-semibold">Sr. No.</th>
                      <th className="pb-3.5 font-semibold">Student Name</th>
                      <th className="pb-3.5 font-semibold">Start Date</th>
                      <th className="pb-3.5 font-semibold">Contact</th>
                      <th className="pb-3.5 font-semibold">Attendance</th>
                      <th className="pb-3.5 font-semibold">Fees</th>
                      <th className="pb-3.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                    {availableStudents
                      .filter((st) =>
                        st.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                        st.contact.includes(studentSearchQuery)
                      )
                      .map((st, index) => {
                        const isChecked = checkedStudents.some((s) => s.contact === st.contact);
                        return (
                          <tr key={index} className="hover:bg-[#FFB908]/5 transition-colors">
                            <td className="py-3 text-[#050720]/70">{String(index + 1).padStart(2, '0')}</td>
                            <td className="py-3 font-medium">{st.name}</td>
                            <td className="py-3 text-[#050720]/70">{st.startDate}</td>
                            <td className="py-3 text-[#050720]/70">{st.contact}</td>
                            <td className="py-3 font-semibold">{st.attendance}</td>
                            <td className="py-3 font-semibold">{st.fees}</td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => toggleStudentCheck(st)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ml-auto cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#FFB908] border-[#FFB908] text-[#050720]'
                                    : 'border-[#050720]/30 hover:border-[#050720]'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#050720]/10">
              <button
                onClick={() => setCurrentView('details')}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleConfirmAddStudents}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Selected ({checkedStudents.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW STUDENT DETAILS */}
      {currentView === 'student-detail' && selectedStudent && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Student Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold text-sm">{selectedStudent.name.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">{selectedStudent.name.split(' ').slice(1).join(' ') || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold text-sm">{selectedStudent.contact}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Fees</span>
                <span className="font-semibold text-sm">{selectedStudent.fees}</span>
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
                <span className="font-semibold text-sm">{selectedStudent.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Address</span>
                <span className="font-semibold text-sm">Pune</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold font-['Sora']">Attendance</h3>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'This Month', percent: dynamicPercent },
                      { label: 'Last Month', percent: dynamicPercent },
                      { label: 'Average', percent: dynamicPercent },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#F8FAFC] border border-[#050720]/10 rounded-xl p-5">
                        <span className="text-2xl font-extrabold font-['Sora'] block">{stat.percent}%</span>
                        <div
                          className={`w-24 h-1.5 rounded-full mx-auto my-2 transition-all duration-300 ${
                            stat.percent >= 75 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                          }`}
                          style={{ width: `${Math.max(12, stat.percent)}%` }}
                        />
                        <span className="text-[11px] text-[#050720]/50 font-medium">{stat.label}</span>
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

      {/* 6. VIEW LECTURES SCREEN */}
      {currentView === 'lecture-view' && selectedLecture && selectedBatch && (
        <div className="space-y-6">
          <button
            onClick={() => setCurrentView('details')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Lecture View</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-['Sora']">Lecture Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Lecture title</span>
                <span className="font-semibold text-sm">{selectedLecture.title}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedLecture.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Date</span>
                <span className="font-semibold text-sm">{selectedLecture.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Time Slot</span>
                <span className="font-semibold text-sm">{selectedLecture.timeSlot}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Topics Covered</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#050720]/80 mt-1">
                  {selectedLecture.topics?.map((top, idx) => (
                    <li key={idx}>{top}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Assignment Given</span>
                <span className="font-semibold text-xs text-[#050720]/80 mt-1 block">
                  {selectedLecture.assignment}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};