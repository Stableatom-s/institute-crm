import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../lib/api";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"details" | "reset">("details");

  // Reset Password form fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals & Feedback popups
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capitalize role for display
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : "Admin";

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteReset = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("crm_token");
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowSuccessModal(false);
        setView("details");
      }, 1500);
    } catch (err: any) {
      setShowConfirmModal(false);
      setError(err.message || "Error occurred while resetting password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-['Onest'] text-[#050720] space-y-6 pb-16">
      {/* ========================================================= */}
      {/* 1. PROFILE DETAILS VIEW (MATCHING FIGMA SCREEN)          */}
      {/* ========================================================= */}
      {view === "details" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora'] text-[#050720]">
            Profile
          </h1>

          <div className="bg-white rounded-xl border border-[#050720]/15 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold font-['Sora'] text-[#050720]">
              Personal Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="p-3.5 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block font-medium">
                  Name
                </span>
                <span className="text-xs font-semibold text-[#050720] block mt-0.5">
                  {user?.name || "Tanmay Kalbhor"}
                </span>
              </div>

              {/* Email */}
              <div className="p-3.5 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block font-medium">
                  Email
                </span>
                <span className="text-xs font-semibold text-[#050720] block mt-0.5">
                  {user?.email || "admin@radiquolab.com"}
                </span>
              </div>

              {/* Role */}
              <div className="p-3.5 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block font-medium">
                  Role
                </span>
                <span className="text-xs font-semibold text-[#050720] block mt-0.5">
                  {displayRole}
                </span>
              </div>

              {/* Password Preview */}
              <div className="p-3.5 bg-white border border-[#050720]/15 rounded-lg">
                <span className="text-[10px] text-[#050720]/50 block font-medium">
                  Password
                </span>
                <span className="text-xs font-semibold text-[#050720] tracking-widest block mt-0.5">
                  ••••••••
                </span>
              </div>
            </div>
          </div>

          {/* Reset Password Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setError("");
                setView("reset");
              }}
              className="w-80 py-3 bg-white hover:bg-[#050720]/5 border border-[#050720]/30 text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors shadow-xs cursor-pointer text-center"
            >
              Reset Password
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. RESET PASSWORD FORM VIEW                              */}
      {/* ========================================================= */}
      {view === "reset" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-['Sora'] text-[#050720]">
              Reset Password
            </h1>
            <button
              onClick={() => {
                setError("");
                setView("details");
              }}
              className="text-xs font-bold text-[#050720]/60 hover:text-[#050720] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleOpenConfirm} className="space-y-6">
            <div className="bg-white rounded-xl border border-[#050720]/15 p-6 shadow-xs space-y-5">
              {/* Old Password */}
              <div className="relative">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white pt-6 pb-2.5 px-4 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium tracking-widest focus:outline-none focus:border-[#050720]/40 transition-colors"
                  required
                />
                <label className="text-[10px] text-[#050720]/50 absolute top-2 left-4 pointer-events-none font-medium">
                  Old Password
                </label>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white pt-6 pb-2.5 px-4 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium tracking-widest focus:outline-none focus:border-[#050720]/40 transition-colors"
                  required
                />
                <label className="text-[10px] text-[#050720]/50 absolute top-2 left-4 pointer-events-none font-medium">
                  New Password
                </label>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white pt-6 pb-2.5 px-4 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium tracking-widest focus:outline-none focus:border-[#050720]/40 transition-colors"
                  required
                />
                <label className="text-[10px] text-[#050720]/50 absolute top-2 left-4 pointer-events-none font-medium">
                  Confirm Password
                </label>
              </div>
            </div>

            {/* Bottom Right Reset Trigger */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-80 py-3 bg-white hover:bg-[#050720]/5 border border-[#050720]/30 text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors shadow-xs cursor-pointer text-center"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL 1: CONFIRM RESET PASSWORD MODAL ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div>
              <h2 className="text-base font-bold font-['Sora'] text-[#050720]">
                Reset Password?
              </h2>
              <p className="text-xs text-[#050720]/60 mt-1 font-medium">
                Confirm password reset
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: PASSWORD CHANGED SUCCESS ALERT ─── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-2 shadow-2xl">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">
              Password Changed
            </h3>
            <p className="text-xs text-[#050720]/60">
              Your password has been successfully reset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
