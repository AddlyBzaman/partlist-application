// app/dashboard/bahan/LogoutModal.tsx
import React from "react";
import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <LogOut size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Konfirmasi Logout
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-sm mb-2">
            Apakah Anda yakin ingin keluar dari aplikasi?
          </p>
          <p className="text-gray-500 text-xs">
            Anda akan diarahkan kembali ke halaman login.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded text-sm font-medium transition-all shadow-sm hover:shadow"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 border border-red-600 text-white rounded text-sm font-medium transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <LogOut size={16} />
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
