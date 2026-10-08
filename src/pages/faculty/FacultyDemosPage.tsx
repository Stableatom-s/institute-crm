import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { demoService, DemoItem as ServiceDemoItem, DemoTab } from '../../services/demoService';

type PageView = 'list' | 'details';

interface DemoItem {
  id: string;
  srNo: string;
  leadName: string;
  facultyName: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  status: DemoTab;
  demoStatus?: string;
  remark?: string;
  feedback?: string;
  cancellationReason?: string;
  screenshotUrl?: string;
}

export const FacultyDemoPage: React.FC = () => {
  const auth = useAuth() as any;
  const currentUserName = (auth?.user?.name || '').trim().toLowerCase();

  const [activeTab, setActiveTab] = useState<DemoTab>('Scheduled');
  const [currentView, setCurrentView] = useState<PageView>('list');
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [modeFilter, setModeFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');

  // Form State
  const [feedbackText, setFeedbackText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('name.jpeg/png/jpg');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // STRICT FILTER: Load only demos assigned to the logged-in faculty
  const loadFacultyDemos = async () => {
    try {
      setIsLoading(true);
      const data = await demoService.getAllDemos();

      const facultyDemos = data.filter((d) => {
        const demoFaculty = (d.faculty || '').trim().toLowerCase();
        return (
          demoFaculty === currentUserName ||
          (currentUserName.length > 0 && demoFaculty.includes(currentUserName)) ||
          (demoFaculty.length > 0 && currentUserName.includes(demoFaculty))
        );
      });

      const mapped: DemoItem[] = facultyDemos.map((d: ServiceDemoItem) => ({
        id: d.id,
        srNo: '',
        leadName: `${d.name} ${d.lastName || ''}`.trim(),
        facultyName: d.faculty,
        timeSlot: d.timeSlot,
        demoDate: d.demoDate,
        course: d.course,
        mode: d.mode,
        status: d.status,
        demoStatus: d.demoStatusText || (d.status === 'Completed' ? 'Attended' : undefined),
        remark: d.remark || (d.status === 'Completed' ? 'Joining soon' : undefined),
        feedback: d.feedback,
        cancellationReason: d.cancellationReason,
        screenshotUrl: (d as any).screenshotUrl,
      }));

      setDemos(mapped);
    } catch (err) {
      console.error('Failed to load faculty demos from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserName) {
      loadFacultyDemos();
    }
  }, [currentUserName]);

  const filteredDemos = demos.filter((item) => {
    if (item.status !== activeTab) return false;
    if (modeFilter !== 'All' && item.mode !== modeFilter) return false;
    if (courseFilter !== 'All' && item.course !== courseFilter) return false;
    return true;
  });

  const handleOpenDetails = (demo: DemoItem) => {
    setSelectedDemo(demo);
    setFeedbackText(
      demo.feedback ||
        'Student showed strong interest in the course structure and tools. Asked relevant questions about projects and placement support. Recommended for follow-up within 24 hours.'
    );
    setUploadedFileName('name.jpeg/png/jpg');
    setPreviewImage(demo.screenshotUrl || null);
    setCurrentView('details');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveCompleted = async () => {
    if (!selectedDemo) return;

    try {
      await demoService.updateDemoStatus(selectedDemo.id, 'Completed', {
        feedback: feedbackText,
        screenshotUrl: previewImage || undefined,
      } as any);

      setDemos((prev) =>
        prev.map((d) =>
          d.id === selectedDemo.id
            ? { ...d, feedback: feedbackText, screenshotUrl: previewImage || undefined }
            : d
        )
      );
      alert('Demo feedback saved successfully!');
      setCurrentView('list');
    } catch (err) {
      console.error('Failed to update demo on database:', err);
      alert('Error saving feedback to server.');
    }
  };

  return (
    <div className="font-['Onest'] space-y-6 pb-12">
      {/* 1. LIST VIEW */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">Demo Management</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-[#050720]/10 pb-0">
              {(['Scheduled', 'Completed', 'Cancelled'] as DemoTab[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
                      isActive ? 'text-[#050720]' : 'text-[#050720]/40 hover:text-[#050720]/70'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFB908] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 my-5">
              <span className="text-xs text-[#050720]/60 font-medium">Sort by:</span>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none"
              >
                <option value="All">Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border border-[#050720]/15 rounded-md px-3 py-1 text-xs text-[#050720] bg-white focus:outline-none"
              >
                <option value="All">Course</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="No Code">No Code</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Full-Stack">Full-Stack</option>
              </select>
            </div>

            {/* Live Demo Table */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading demo sessions from database...
              </div>
            ) : filteredDemos.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No {activeTab.toLowerCase()} demos assigned to you.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720]/70 pb-3 font-semibold">
                    <th className="pb-3">Sr. No.</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Time Slot</th>
                    <th className="pb-3">Demo Date</th>
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Mode</th>
                    {activeTab === 'Completed' && (
                      <>
                        <th className="pb-3">Demo Status</th>
                        <th className="pb-3">Remark</th>
                      </>
                    )}
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {filteredDemos.map((row, index) => (
                    <tr key={row.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-medium">{row.leadName}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.timeSlot}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.demoDate}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.course}</td>
                      <td className="py-3.5 text-[#050720]/70">{row.mode}</td>
                      {activeTab === 'Completed' && (
                        <>
                          <td className="py-3.5 text-[#050720]/70">{row.demoStatus || 'Attended'}</td>
                          <td className="py-3.5 text-[#050720]/70">{row.remark || 'Joining soon'}</td>
                        </>
                      )}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetails(row)}
                          className="px-3.5 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-3 mt-6 text-xs text-[#050720]/60">
              <span>Jump to</span>
              <span className="border border-[#050720]/20 rounded px-2 py-0.5 text-[#050720] font-medium">01</span>
              <span>&lt; 01 of 10 &gt;</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. DETAILS VIEW */}
      {currentView === 'details' && selectedDemo && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('list')}
              className="p-1 rounded hover:bg-slate-100 text-[#050720] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#050720] font-['Sora']">
              {selectedDemo.status === 'Scheduled' && 'Scheduled demo details'}
              {selectedDemo.status === 'Completed' && 'Completed demo details'}
              {selectedDemo.status === 'Cancelled' && 'Cancelled demo details'}
            </h1>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-[#050720] font-['Sora']">Demo Overview</h3>

            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Lead Name</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.leadName}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Faculty Name</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.facultyName}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Demo Date</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.demoDate}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Demo Time</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.timeSlot}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Course</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.course}</span>
              </div>
              <div>
                <span className="text-[#050720]/50 block text-[11px]">Mode</span>
                <span className="font-semibold text-[#050720]">{selectedDemo.mode}</span>
              </div>

              {selectedDemo.status === 'Cancelled' && (
                <div className="col-span-2 pt-2">
                  <span className="text-[#050720]/50 block text-[11px]">Reason for cancellation</span>
                  <span className="text-xs text-[#050720] font-medium mt-0.5 block">
                    {selectedDemo.cancellationReason || 'Unavailable for demo'}
                  </span>
                </div>
              )}
            </div>

            {selectedDemo.status === 'Completed' && (
              <div className="space-y-4 pt-2 border-t border-[#050720]/5">
                <div>
                  <label className="text-[11px] text-[#050720]/60 block mb-1">Demo feedback</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={3}
                    className="w-full border border-[#050720]/15 rounded-lg p-3 text-xs text-[#050720] focus:outline-none focus:border-[#FFB908]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#050720]/60 block mb-2">Attendance screenshot</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-[#050720]/30 rounded-lg text-xs font-semibold text-[#050720] cursor-pointer hover:bg-slate-50 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Attendance Screenshot</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-[#050720]/50">{uploadedFileName}</span>
                  </div>
                </div>

                {previewImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[#050720]/10 max-w-xl">
                    <img src={previewImage} alt="Attendance verification" className="w-full h-auto object-cover" />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSaveCompleted}
                    className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};