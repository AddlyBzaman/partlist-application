import React from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Hapus Data</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Apakah Anda yakin ingin menghapus data berikut?
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                {itemName}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Hapus Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
