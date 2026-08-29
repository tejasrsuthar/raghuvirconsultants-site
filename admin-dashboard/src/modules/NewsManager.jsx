import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Newspaper, Plus, Trash2, Edit3, ExternalLink, RefreshCw, Calendar, Radio, Globe } from 'lucide-react';
import NewsEditorPage from './NewsEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function NewsManager() {
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
      const res = await fetch(`${API_BASE_URL}/api/news?page=1&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        toast.error('Failed to load news items');
      }
    } catch (e) {
      toast.error('Network error loading news items');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting news item "${deleteConfirmItem.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('News article deleted successfully', { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems();
      } else {
        toast.error('Failed to delete news article', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting news', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  if (showEditor) {
    return (
      <NewsEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Market news broadcasted successfully!');
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
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Market Wire & Announcements</h2>
              <p className="text-xs text-gray-500 mt-0.5">Publish market intelligence, macroeconomic developments, and regulatory bulletins</p>
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
              <Plus className="w-4 h-4" /> Post Announcement
            </button>
            <button
              onClick={fetchItems}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh News"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* News Stream Cards */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-rose-600" />
          Loading news ticker...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
          No news items broadcasted yet. Click "Post Announcement" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((news) => (
            <div 
              key={news.id} 
              className="bg-white border border-gray-200 rounded-3xl p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-rose-600 animate-pulse" /> Live Wire
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(news.published_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {news.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[44px]">
                  {news.summary || news.content}
                </p>
              </div>

              {/* Action Buttons & Source Link */}
              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                {news.source_url ? (
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Source Link
                  </a>
                ) : <span className="text-gray-300 text-xs">—</span>}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingItem(news);
                      setShowEditor(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                    title="Edit News"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmItem(news)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    title="Delete News"
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
        title={`Delete News Announcement?`}
        message={`Are you sure you want to delete "${deleteConfirmItem?.title}"? It will be removed from all investor ticker feeds.`}
        confirmText="Delete Announcement"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}
