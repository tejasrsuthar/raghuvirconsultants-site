import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function NewsAnnouncements() {
  const [news, setNews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsAndNotifications();
  }, []);

  const fetchNewsAndNotifications = async () => {
    setLoading(true);
    try {
      const [newsRes, notifRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/news?page=1&limit=10`),
        fetch(`${API_BASE_URL}/api/notifications?page=1&limit=10&status=published`)
      ]);

      if (newsRes.ok) {
        const data = await newsRes.json();
        setNews(data.items || []);
      }
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error("Error fetching news/notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto min-h-[90vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Investor Dashboard', to: '/investor' },
          { label: 'News & Announcements' }
        ]}
      />

      <div className="flex justify-between items-center mb-8 border-b border-bordercolor pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-forest flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-lime" /> News & Announcements
          </h1>
          <p className="text-sm text-textmuted mt-1">Real-time market insights and official advisory broadcasts</p>
        </div>
        <button
          onClick={fetchNewsAndNotifications}
          className="p-2.5 rounded-full bg-sand border border-bordercolor hover:border-forest transition-all text-textmuted hover:text-forest"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Broadcast Notifications */}
      {notifications.length > 0 && (
        <div className="mb-10 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-textmuted">Official Broadcasts</h2>
          {notifications.map((n) => (
            <div key={n.id} className="bg-forest/5 border border-forest/20 p-5 rounded-2xl flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-lime mt-1.5 shrink-0" />
              <div>
                <h3 className="font-bold text-forest text-base">{n.title}</h3>
                <p className="text-sm text-textmuted mt-1 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-4 text-xs text-textmuted/80 mt-3">
                  <span>Issued by: <strong>{n.created_by || 'Admin'}</strong></span>
                  <span>•</span>
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Items Grid */}
      <h2 className="text-xs font-bold uppercase tracking-widest text-textmuted mb-4">Market News Feed</h2>
      {loading ? (
        <div className="text-center py-12 text-textmuted text-sm">Loading market news...</div>
      ) : news.length === 0 ? (
        <div className="bg-white border border-bordercolor p-8 rounded-3xl text-center text-textmuted text-sm">
          No market news posted yet. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-textmuted mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold text-forest mb-2">{item.title}</h3>
                <p className="text-sm text-textmuted leading-relaxed">{item.summary}</p>
              </div>
              {item.link && item.link !== '#' && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
                >
                  Read Full Article <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
