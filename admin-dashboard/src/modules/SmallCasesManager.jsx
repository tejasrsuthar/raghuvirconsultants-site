import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit3, Layers, TrendingUp, ShieldAlert, RefreshCw, ExternalLink } from 'lucide-react';
import SmallCaseEditorPage from './SmallCaseEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function SmallCasesManager() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/smallcases?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        toast.error('Failed to load Smallcase strategies');
      }
    } catch (e) {
      toast.error('Network error loading smallcases');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting smallcase strategy "${deleteConfirmItem.name}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/smallcases/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Smallcase "${deleteConfirmItem.name}" deleted successfully`, { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems();
      } else {
        toast.error('Failed to delete smallcase', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting smallcase', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  if (showEditor) {
    return (
      <SmallCaseEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Smallcase strategy saved successfully!');
          fetchItems();
        }}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smallcase Model Strategies</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage thematic equity baskets, CAGR historical track records, and execution links</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowEditor(true);
              }}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add Strategy
            </button>
            <button
              onClick={fetchItems}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Strategies"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Smallcase Cards Grid */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
          Loading Smallcase baskets...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
          No Smallcase strategies added yet. Click "Add Strategy" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((sc) => (
            <div 
              key={sc.id} 
              className="bg-white border border-gray-200 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-teal-50 text-teal-700">
                      Thematic Basket
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{sc.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 flex items-center gap-0.5 justify-end">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {sc.cagr || '0'}%
                    </span>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">3Y CAGR</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[48px]">
                  {sc.description || 'Systematic multi-cap algorithmic portfolio designed for long-term compound growth.'}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Min Investment</span>
                    <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">₹{Number(sc.min_investment || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Risk Profile</span>
                    <span className="text-xs font-bold text-amber-700 mt-1 block">Moderate / High</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                {sc.link ? (
                  <a
                    href={sc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Smallcase Portal
                  </a>
                ) : <span className="text-gray-300 text-xs">—</span>}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingItem(sc);
                      setShowEditor(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                    title="Edit Strategy"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmItem(sc)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    title="Delete Strategy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Smallcase Strategy?`}
        message={`Are you sure you want to delete strategy "${deleteConfirmItem?.name}"? It will be removed from public investor discovery.`}
        confirmText="Delete Strategy"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}
