import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: {
    name: string;
    contactNo: string;
    course: string;
    status: string;
    remark: string;
  }) => void;
}

const COURSES = ['UI/UX Design', 'No Code', 'Full-Stack', 'Portfolio'];

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [course, setCourse] = useState(COURSES[0]);
  const [status, setStatus] = useState('New');
  const [remark, setRemark] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactNo) return;
    onSubmit({ name, contactNo, course, status, remark });
    setName('');
    setContactNo('');
    setRemark('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 font-['Onest'] text-[#050720]">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold font-['Sora']">Add New Lead</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 text-[#050720]/40 hover:text-[#050720] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-[#050720]/60 block mb-1 font-semibold">
              Full Name*
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#050720]/60 block mb-1 font-semibold">
              Contact Number*
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full bg-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#050720]/60 block mb-1 font-semibold">
              Interested Course
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#050720]/60 block mb-1 font-semibold">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Demo Scheduled">Demo Scheduled</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#050720]/60 block mb-1 font-semibold">
              Remark
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Call back tomorrow morning"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-[#F8FAFC] p-3 rounded-lg border border-[#050720]/15 focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg font-bold hover:bg-[#050720]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg font-bold shadow-xs transition-colors"
            >
              Add Lead
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};