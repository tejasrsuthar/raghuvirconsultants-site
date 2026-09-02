import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function SupportInboxManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/admin/all`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data || []);
      } else {
        toast.error('Failed to load tickets');
      }
    } catch (e) {
      toast.error('Network error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyContent })
      });
      if (res.ok) {
        toast.success('Reply sent');
        setReplyContent('');
        // Refresh specific ticket
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        fetchTickets(); // Refresh list to update timestamps
      } else {
        toast.error('Failed to send reply');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setReplying(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/admin/${selectedTicket.id}/close`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Ticket closed');
        const updatedTicket = await res.json();
        setSelectedTicket(updatedTicket);
        fetchTickets();
      }
    } catch (e) {
      toast.error('Error closing ticket');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading inbox...</div>;

  return (
    <div className="w-full h-[80vh] flex gap-6 max-w-7xl mx-auto">
      {/* Left Sidebar: Ticket List */}
      <div className="w-1/3 bg-white rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" /> Inbox
          </h2>
          <button onClick={fetchTickets} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-100' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ticket.investor_id.substring(0, 8)}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {ticket.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate">{ticket.subject}</h3>
              <p className="text-xs text-gray-500 truncate mt-1">{ticket.messages[ticket.messages.length - 1]?.content}</p>
            </button>
          ))}
          {tickets.length === 0 && <div className="p-10 text-center text-sm text-gray-400">No tickets found.</div>}
        </div>
      </div>

      {/* Right Content: Chat View */}
      <div className="flex-1 bg-white rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                  Ticket #{selectedTicket.id.substring(0, 8)} • Priority: {selectedTicket.priority}
                </div>
              </div>
              {selectedTicket.status === 'open' && (
                <button onClick={handleCloseTicket} className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Close Ticket
                </button>
              )}
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {selectedTicket.messages.map(msg => {
                const isAdmin = msg.is_from_admin;
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-xs ${isAdmin ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-2 block ${isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            {selectedTicket.status === 'open' ? (
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none h-20"
                  />
                  <button 
                    onClick={handleReply}
                    disabled={replying || !replyContent.trim()}
                    className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white p-4 rounded-2xl flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-sm font-medium text-gray-500">
                This ticket is closed.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
            <p className="font-medium">Select a ticket to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
