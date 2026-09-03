import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Send, RefreshCw, Info } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';
import toast from 'react-hot-toast';

export default function InvestorSupport() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  
  // New ticket state
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/portal/login');
      return;
    }
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data || []);
      }
    } catch (e) {
      toast.error("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: newSubject,
          message: newMessage,
          priority
        })
      });
      if (res.ok) {
        toast.success("Support ticket created.");
        setIsCreating(false);
        setNewSubject('');
        setNewMessage('');
        setPriority('normal');
        fetchTickets();
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !activeTicket) return;
    setReplying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyContent })
      });
      if (res.ok) {
        setReplyContent('');
        const updatedTicket = await res.json();
        setActiveTicket(updatedTicket);
        fetchTickets(); // Refresh list silently
      } else {
        toast.error("Failed to send reply");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="pt-32 pb-32 px-6 max-w-6xl mx-auto min-h-screen bg-[#F3F0EE]">
      <Breadcrumb items={[{ label: 'Investor Dashboard', to: '/investor' }, { label: 'Help Desk' }]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-12 mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Support Help Desk</h1>
          <p className="mt-2 text-gray-600 font-medium">Get priority support for billing, access, or platform issues.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setActiveTicket(null);
          }}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Open New Ticket
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
        {/* Ticket List */}
        <div className="w-full lg:w-1/3 bg-white rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Your Tickets</h2>
            <button onClick={fetchTickets} className="text-gray-400 hover:text-gray-900 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => {
                  setActiveTicket(ticket);
                  setIsCreating(false);
                }}
                className={`w-full text-left p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeTicket?.id === ticket.id ? 'bg-blue-50/50 border-blue-100' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {new Date(ticket.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 truncate">{ticket.subject}</h3>
              </button>
            ))}
            {!loading && tickets.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-400 font-medium">
                No support tickets history.
              </div>
            )}
          </div>
        </div>

        {/* Detail/Create View */}
        <div className="w-full lg:w-2/3 bg-white rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {isCreating ? (
            <div className="p-8 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Open a Support Ticket</h2>
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                    placeholder="Briefly describe your issue..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none bg-white"
                  >
                    <option value="low">Low - General Inquiry</option>
                    <option value="normal">Normal - Standard Support</option>
                    <option value="high">High - Important Issue</option>
                    <option value="urgent">Urgent - Platform Outage / Billing Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Message Content</label>
                  <textarea
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[160px] resize-none"
                    placeholder="Provide details so we can help you faster..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-4 rounded-full font-bold text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">{activeTicket.subject}</h2>
                <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  <span>Ticket #{activeTicket.id.substring(0,8)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Priority: {activeTicket.priority}</span>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {activeTicket.messages.map(msg => {
                  const isMine = !msg.is_from_admin;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${isMine ? 'bg-[#F3F0EE] text-gray-900 rounded-br-sm' : 'bg-gray-900 text-white rounded-bl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[10px] mt-2 block ${isMine ? 'text-gray-500' : 'text-gray-400'}`}>
                          {isMine ? 'You' : 'Support Team'} • {new Date(msg.timestamp).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Area */}
              {activeTicket.status === 'open' ? (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 border border-gray-200 rounded-full px-6 py-4 text-sm font-medium focus:outline-none focus:border-gray-400 shadow-inner"
                  />
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyContent.trim()}
                    className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
                  <Info className="w-4 h-4" /> This support ticket is closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
              <p className="font-medium text-gray-500">Select a ticket or open a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
