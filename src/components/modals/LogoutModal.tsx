import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    localStorage.removeItem('radiquolab_punch_in');
    localStorage.removeItem('crm_token');
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050720]/50 backdrop-blur-xs flex items-center justify-center p-4 font-['Onest']">
      <div className="bg-white rounded-2xl p-8 max-w-[420px] w-full shadow-2xl text-center space-y-3">
        <h3 className="text-base font-bold font-['Sora'] text-[#050720]">
          Log out of your account?
        </h3>
        <p className="text-xs text-[#050720]/60">
          You'll need to sign in again to access your dashboard.
        </p>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};