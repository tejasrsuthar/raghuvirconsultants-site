import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, Plus, Trash2, Edit3, Tag, Search, RefreshCw, Calendar, Clock, Eye, CheckCircle2 } from 'lucide-react';
import BlogEditorPage from './BlogEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function BlogPostManager() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Confirmation Modal
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBlogs();
  }, [page, selectedTag]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const url = selectedTag 
        ? `${API_BASE_URL}/api/blogs?page=${page}&limit=12&tag=${encodeURIComponent(selectedTag)}`
        : `${API_BASE_URL}/api/blogs?page=${page}&limit=12`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.items || []);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (e) {
      toast.error('Network error loading blogs');
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmPost) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting blog post "${deleteConfirmPost.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${deleteConfirmPost.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Blog post deleted successfully', { id: toastId });
        setDeleteConfirmPost(null);
        fetchBlogs();
      } else {
        toast.error('Failed to delete blog post', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting blog post', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (showEditor) {
    return (
      <BlogEditorPage
        initialData={editingPost}
        onBack={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingPost(null);
          toast.success('Blog article published successfully!');
          fetchBlogs();
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editorial & Knowledge Hub</h2>
              <p className="text-xs text-gray-500 mt-0.5">Publish market insights, educational guides, and wealth management thought leadership</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingPost(null);
                setShowEditor(true);
              }}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> New Article
            </button>
            <button
              onClick={fetchBlogs}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Articles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="relative min-w-[180px]">
              <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by tag..."
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Article Grid Cards */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
          Loading editorial articles...
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-500">
          No articles published yet. Click "New Article" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.map((post) => (
            <div 
              key={post.id} 
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Top Tags & Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(post.tags || []).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
                  {post.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {post.summary || post.content}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 3 min read
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setShowEditor(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                    title="Edit Article"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmPost(post)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                    title="Delete Article"
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
        isOpen={!!deleteConfirmPost}
        title={`Delete Blog Post?`}
        message={`Are you sure you want to delete "${deleteConfirmPost?.title}"? It will be immediately unpublished from the public website.`}
        confirmText="Delete Post"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmPost(null)}
      />
    </div>
  );
}
