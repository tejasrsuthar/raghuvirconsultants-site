import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, Plus, Trash2, Edit3, Tag, Search, RefreshCw, ArrowUpDown, Calendar, Eye, FileText } from 'lucide-react';
import BlogEditorPage from './BlogEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import NumberedPagination from '../components/NumberedPagination';
import { API_BASE_URL } from '../config/apiConfig';

export default function BlogPostManager() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({ range: 'all', customStart: '', customEnd: '' });

  // Sorting State
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Confirmation Modal
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBlogs(page);
  }, [page, selectedTag]);

  const fetchBlogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const url = selectedTag 
        ? `${API_BASE_URL}/api/blogs?page=${currentPage}&limit=10&tag=${encodeURIComponent(selectedTag)}`
        : `${API_BASE_URL}/api/blogs?page=${currentPage}&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (e) {
      toast.error('Network error loading blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
        fetchBlogs(page);
      } else {
        toast.error('Failed to delete blog post', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting blog post', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBlogs = blogs
    .filter(b => {
      const matchesSearch = searchQuery === '' ||
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDate = isDateWithinRange(b.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

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
          toast.success('Blog article saved successfully!');
          fetchBlogs(page);
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
              <h2 className="text-xl font-bold text-gray-900">Blog & Editorial Directory</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage market insights, educational guides, and thought leadership articles</p>
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
              <Plus className="w-4 h-4" /> Create Article
            </button>
            <button
              onClick={() => fetchBlogs(page)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Articles"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col xl:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <DateRangeFilter
              selectedRange={dateFilter.range}
              customStart={dateFilter.customStart}
              customEnd={dateFilter.customEnd}
              onRangeChange={setDateFilter}
            />

            <div className="relative min-w-[160px]">
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

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            Loading editorial articles...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No articles found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Article Title <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Tags & Categories</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Published Date <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((post) => {
                  const rowActions = [
                    {
                      label: 'Edit Article',
                      icon: Edit3,
                      onClick: () => {
                        setEditingPost(post);
                        setShowEditor(true);
                      }
                    },
                    { divider: true },
                    {
                      label: 'Delete Article',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmPost(post)
                    }
                  ];

                  return (
                    <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block max-w-md truncate">{post.title}</span>
                            <span className="text-[11px] text-gray-500 block max-w-md truncate">{post.summary || 'No summary'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(post.tags || []).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200/50">
                              {tag}
                            </span>
                          ))}
                          {(!post.tags || post.tags.length === 0) && <span className="text-gray-400 text-[11px]">—</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(post.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <RowActionMenu items={rowActions} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Numbered Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-100 flex justify-center">
            <NumberedPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmPost}
        title={`Delete Blog Article?`}
        message={`Are you sure you want to permanently delete "${deleteConfirmPost?.title}"?`}
        confirmText="Delete Article"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmPost(null)}
      />
    </div>
  );
}
