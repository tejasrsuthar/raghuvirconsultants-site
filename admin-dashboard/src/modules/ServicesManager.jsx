import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit3, CheckCircle2, RefreshCw, DollarSign, Tag } from 'lucide-react';
import ServiceEditorPage from './ServiceEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function ServicesManager() {
  const [items, setItems] = useState([]);
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
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services?page=1&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        toast.error('Failed to load advisory services');
      }
    } catch (e) {
      toast.error('Network error loading services');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting service "${deleteConfirmItem.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Service "${deleteConfirmItem.title}" deleted successfully`, { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems();
      } else {
        toast.error('Failed to delete service offering', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting service', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  if (showEditor) {
    return (
      <ServiceEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Service offering saved successfully!');
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
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Advisory Plans & Subscription Tiers</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage subscription products, pricing structures, and included client benefits</p>
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
              <Plus className="w-4 h-4" /> Add Service Tier
            </button>
            <button
              onClick={fetchItems}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Services"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Service Tiers Grid Cards */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
          Loading service offerings...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
          No advisory services configured. Click "Add Service Tier" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((service) => (
            <div 
              key={service.id} 
              className="bg-white border border-gray-200 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700">
                      Advisory Tier
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{service.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900">₹{Number(service.price || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 block font-semibold">/ month</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[48px]">
                  {service.description || 'Full institutional-grade investment research and model portfolio updates.'}
                </p>

                {/* Service Features Checklist */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time research notes & alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Model portfolio allocation weights</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SEBI compliance reporting</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingItem(service);
                    setShowEditor(true);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Tier
                </button>
                <button
                  onClick={() => setDeleteConfirmItem(service)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Service Tier?`}
        message={`Are you sure you want to delete service tier "${deleteConfirmItem?.title}"? Existing subscriber access terms will need to be re-assigned.`}
        confirmText="Delete Tier"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}
