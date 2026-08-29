import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Save, Eye, Edit3, Tag, Sparkles, CheckCircle2, 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, Code, FileCode, Link, Image, Table, 
  Minus, RefreshCw 
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { API_BASE_URL } from '../config/apiConfig';

export function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s_-]+/g, '-')  // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // trim leading and trailing hyphens
}

export default function BlogEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug);
  const [markdownContent, setMarkdownContent] = useState(initialData?.markdown_content || initialData?.content || '');
  const [tagsInput, setTagsInput] = useState((initialData?.tags || []).join(', '));
  const [status, setStatus] = useState(initialData?.status || 'published');

  const [editorMode, setEditorMode] = useState('split'); // 'write' | 'preview' | 'split'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const textareaRef = useRef(null);
  const token = localStorage.getItem('token');

  // Handle Title Change with Automatic Slug Generation
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (!isSlugManuallyEdited || !slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Re-sync Slug from Title
  const handleSyncSlug = () => {
    const autoSlug = generateSlug(title);
    setSlug(autoSlug);
    setIsSlugManuallyEdited(false);
    toast.success('URL slug regenerated from title');
  };

  // Markdown Toolbar Action Handler
  const insertFormatting = (prefix, suffix = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const selectedText = currentText.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setMarkdownContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim()) {
      setError('Article title is required.');
      toast.error('Article title is required');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const finalSlug = slug.trim() || generateSlug(title);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      markdown_content: markdownContent,
      content: markdownContent,
      tags: tagsArray,
      status
    };

    const url = editingId ? `${API_BASE_URL}/api/blogs/${editingId}` : `${API_BASE_URL}/api/blogs`;
    const method = editingId ? 'PUT' : 'POST';

    setLoading(true);
    const toastId = toast.loading(editingId ? 'Updating blog post...' : 'Publishing blog post...');

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save blog post');
      }

      setSuccess(true);
      toast.success(editingId ? 'Blog post updated successfully' : 'Blog post published successfully', { id: toastId });
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 800);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save blog post', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles List
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Edit3 className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Article...' : editingId ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Article saved successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title & Slug Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Article Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Most exciting buys from the Mutual Funds"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">URL Slug (Auto-Generated)</label>
              <button
                type="button"
                onClick={handleSyncSlug}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                title="Regenerate slug from current title"
              >
                <RefreshCw className="w-3 h-3" /> Sync from Title
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. most-exciting-buys-from-the-mutual-funds"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManuallyEdited(true);
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tags & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-500" /> Tags (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. mutualFunds, investing, datacenter"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            {/* Tag Pills Preview */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tagsInput.split(',').filter(t => t.trim().length > 0).map((tag, idx) => (
                <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="published">Published (Live)</option>
              <option value="draft">Draft (Internal)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Markdown Content Editor Box */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
            <span className="text-xs font-bold text-gray-700 uppercase">Markdown Editor & Live Preview</span>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-full gap-1">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  editorMode === 'write' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  editorMode === 'preview' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  editorMode === 'split' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Split Mode
              </button>
            </div>
          </div>

          {/* Markdown Toolbar (available in Write & Split modes) */}
          {editorMode !== 'preview' && (
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-2xl">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'bold text')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Bold (**text**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'italic text')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Italic (*text*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Strikethrough (~~text~~)"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('# ', '', 'Heading 1')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Heading 1 (# text)"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ', '', 'Heading 2')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Heading 2 (## text)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '', 'Heading 3')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Heading 3 (### text)"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('> ', '', 'Quote note')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Blockquote (> text)"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ', '', 'List item')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Bullet List (- item)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Numbered List (1. item)"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('`', '`', 'code')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Inline Code (`code`)"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```\n', '\n```', 'code block content')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Code Block (```code```)"
              >
                <FileCode className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://example.com)', 'link title')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Link ([title](url))"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![', '](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800)', 'Chart Image')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Image (![alt](url))"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('| Header 1 | Header 2 |\n|---|---|\n| Data 1 | Data 2 |\n', '')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n---\n', '')}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
                title="Horizontal Rule (---)"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Editor & Live Rendered Preview Area */}
          <div className="min-h-[400px]">
            {editorMode === 'write' && (
              <textarea
                ref={textareaRef}
                required
                rows="18"
                placeholder="# Article Title&#10;&#10;Write your post content in Markdown format..."
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-3xl text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            )}

            {editorMode === 'preview' && (
              <div className="p-8 bg-white border border-gray-200 rounded-3xl min-h-[400px] shadow-2xs">
                <MarkdownRenderer content={markdownContent} />
              </div>
            )}

            {editorMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Markdown Source</span>
                  <textarea
                    ref={textareaRef}
                    required
                    rows="18"
                    placeholder="# Article Title&#10;&#10;Write your post content in Markdown format..."
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Live Rendered Output</span>
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl overflow-y-auto max-h-[420px] min-h-[400px] shadow-2xs">
                    <MarkdownRenderer content={markdownContent} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
