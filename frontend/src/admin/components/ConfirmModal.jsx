import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  isDestructive = true,
  loading = false,
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md border border-gray-100 shadow-2xl space-y-6 scale-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Please review before executing</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            disabled={loading}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                : 'bg-gray-900 hover:bg-black shadow-gray-900/20'
            } disabled:opacity-50`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
