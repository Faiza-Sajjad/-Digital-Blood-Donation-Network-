import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, Users, Activity, Droplet, MessageSquare, Trash2, Phone, Mail, Bell, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import AdminManagement from '../components/AdminManagement';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ donors: 0, seekers: 0, requests: 0, messages: 0 });
  const [donors, setDonors] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  // ── NEW STATES ──
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [contactUser, setContactUser] = useState(null);
  const [replyFeedback, setReplyFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [sRes, dRes, skRes, rRes, fRes] = await Promise.all([
        fetch("https://digital-blood-donation-network.onrender.com/api/admin/stats", { headers }),
        fetch("https://digital-blood-donation-network.onrender.com/api/admin/donors", { headers }),
        fetch("https://digital-blood-donation-network.onrender.com/api/admin/seekers", { headers }),
        fetch("https://digital-blood-donation-network.onrender.com/api/admin/all-requests", { headers }),
        fetch("https://digital-blood-donation-network.onrender.com/api/admin/feedbacks", { headers })
      ]);
      const sData = await sRes.json();
      const dData = await dRes.json();
      const skData = await skRes.json();
      const rData = await rRes.json();
      const fData = await fRes.json();
      if (sData.success) setStats(sData);
      if (dData.success) setDonors(dData.data);
      if (skData.success) setSeekers(skData.data);
      if (rData.success) setRequests(rData.data);
      if (fData.success) setFeedbacks(fData.data);
    } catch (err) {
      toast.error("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  // ── Socket.IO notifications ──
  useEffect(() => {
    const socket = io("https://digital-blood-donation-network.onrender.com");
    socket.on("connect", () => {
      const userId = localStorage.getItem("userId");
      if (userId) socket.emit("register", userId);
    });
    socket.on("urgent_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast.error(notif.message, {
        duration: 8000,
        description: `Patient: ${notif.patientName} | Blood: ${notif.bloodGroup}`,
      });
    });
    if (Notification.permission === "default") Notification.requestPermission();
    return () => socket.disconnect();
  }, []);

  const handleDelete = async (collection, id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://digital-blood-donation-network.onrender.com/api/admin/${collection}/${id}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) { toast.success("Deleted successfully"); fetchAdminData(); }
      } catch (err) {
        toast.error("Error deleting record");
      }
    }
  };

  // ── Feedback reply ──
  const handleFeedbackReply = async () => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:5000/api/admin/reply-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          toEmail: replyFeedback.email,
          toName: replyFeedback.name,
          message: replyText,
          originalMessage: replyFeedback.message
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reply bhej diya gaya ${replyFeedback.name} ko!`);
        setReplyFeedback(null);
        setReplyText('');
      } else toast.error(data.message || "Reply nahi bheja");
    } catch { toast.error("Server error"); }
    finally { setReplySending(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl text-white"><Heart size={20} fill="white" /></div>
            <h1 className="text-2xl font-black italic">REDLIFE <span className="text-red-600">ADMIN</span></h1>
          </div>
          <div className="flex items-center gap-3">
            {/* ── Notification Bell ── */}
            <button
              onClick={() => setShowNotifPanel(v => !v)}
              className={`relative p-2 rounded-xl border transition-all ${notifications.length > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-transparent'}`}
            >
              <Bell size={18} color={notifications.length > 0 ? '#ef4444' : '#64748b'} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-bold text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Notification Panel ── */}
      {showNotifPanel && (
        <div className="fixed top-24 right-6 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-black text-sm">🔔 Urgent Alerts ({notifications.length})</span>
            <button onClick={() => setNotifications([])} className="text-red-500 text-xs font-bold">Clear All</button>
          </div>
          {notifications.length === 0
            ? <div className="p-8 text-center text-gray-400 text-sm">No alerts yet</div>
            : notifications.map((n, i) => (
              <div key={i} className={`p-4 border-b ${i === 0 ? 'bg-red-50' : ''}`}>
                <p className="text-red-600 font-bold text-sm mb-1">{n.message}</p>
                <p className="text-gray-500 text-xs">👤 {n.patientName} | 🏥 {n.hospital}</p>
                <p className="text-gray-400 text-xs">📞 {n.phone}</p>
              </div>
            ))
          }
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mb-8 overflow-x-auto">
          {['overview', 'donors', 'seekers', 'requests', 'feedbacks', 'admins'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Donors" value={stats.donors} icon={<Users />} color="blue" />
              <StatCard title="Seekers" value={stats.seekers} icon={<Activity />} color="emerald" />
              <StatCard title="Requests" value={stats.requests} icon={<Droplet />} color="red" />
              <StatCard title="Messages" value={stats.messages} icon={<MessageSquare />} color="amber" />
            </motion.div>
          ) : activeTab === 'admins' ? (
            <motion.div key="admins" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <AdminManagement />
            </motion.div>
          ) : activeTab === 'feedbacks' ? (
            <motion.div key="feedbacks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FeedbackTable data={feedbacks} loading={loading} onDelete={handleDelete} onReply={setReplyFeedback} />
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                loading={loading}
                data={activeTab === 'donors' ? donors : activeTab === 'seekers' ? seekers : requests}
                type={activeTab}
                onDelete={handleDelete}
                onContact={setContactUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Contact Modal ── */}
      <AnimatePresence>
        {contactUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={e => e.target === e.currentTarget && setContactUser(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white relative">
                <button onClick={() => setContactUser(null)} className="absolute right-4 top-4 bg-white/20 rounded-full p-1.5"><X size={14} color="white" /></button>
                <h3 className="text-lg font-black">{contactUser.name}</h3>
                <span className="text-slate-300 text-xs capitalize">{contactUser.role}</span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <Phone className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                    <p className="font-bold">{contactUser.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <Mail className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                    <p className="font-bold text-sm">{contactUser.email}</p>
                  </div>
                </div>
                {contactUser.bloodGroup && (
                  <div className="flex items-center gap-3 bg-red-50 rounded-2xl p-4">
                    <Droplet className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</p>
                      <p className="font-black text-red-600 text-lg">{contactUser.bloodGroup}</p>
                    </div>
                  </div>
                )}
                <a href={`tel:${contactUser.phone}`}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-black py-3 rounded-2xl hover:bg-red-700 transition-all">
                  <Phone size={16} /> Call Now
                </a>
                <a href={`https://mail.google.com/mail/?view=cm&to=${contactUser.email}&su=Message from RedLife Admin`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 font-black py-3 rounded-2xl hover:bg-slate-200 transition-all">
                  <Mail size={16} /> Send Email
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback Reply Modal ── */}
      <AnimatePresence>
        {replyFeedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={e => e.target === e.currentTarget && setReplyFeedback(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative">
                <button onClick={() => setReplyFeedback(null)} className="absolute right-4 top-4 bg-white/20 rounded-full p-1.5"><X size={14} color="white" /></button>
                <h3 className="text-lg font-black">Reply to {replyFeedback.name}</h3>
                <p className="text-red-100 text-xs">{replyFeedback.email}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Original Message</p>
                  <p className="text-sm text-gray-700 italic">"{replyFeedback.message}"</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Your Reply</p>
                  <textarea rows={4}
                    className="w-full border-2 border-gray-100 rounded-2xl p-3 text-sm outline-none focus:border-red-500 transition-all resize-none"
                    placeholder="Reply likhein..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                </div>
                <button onClick={handleFeedbackReply} disabled={replySending || !replyText.trim()}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-black py-3 rounded-2xl hover:bg-red-700 transition-all disabled:opacity-50">
                  <Send size={16} /> {replySending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = { blue: "bg-blue-50 text-blue-600", red: "bg-red-50 text-red-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <h3 className="text-slate-400 text-xs font-black uppercase">{title}</h3>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

function DataTable({ data, type, onDelete, loading, onContact }) {
  if (loading) return <div className="p-20 text-center animate-pulse italic text-gray-400">Loading data...</div>;
  return (
    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
          <tr>
            <th className="px-6 py-4">Information</th>
            <th className="px-6 py-4">Group</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50/50">
              <td className="px-6 py-4 font-bold text-sm">{item.name || item.patientName}</td>
              <td className="px-6 py-4"><span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-black">{item.bloodGroup || item.bloodType || 'N/A'}</span></td>
              <td className="px-6 py-4 text-sm text-slate-500">{item.phone || '—'}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onContact(item)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Contact">
                    <Phone size={16} />
                  </button>
                  <button onClick={() => onDelete(type, item._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackTable({ data, loading, onDelete, onReply }) {
  if (loading) return <div className="p-20 text-center animate-pulse italic text-gray-400">Loading data...</div>;
  return (
    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Message</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50/50">
              <td className="px-6 py-4 font-bold text-sm">{item.name}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{item.email}</td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.message}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onReply(item)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Reply">
                    <Send size={16} />
                  </button>
                  <button onClick={() => onDelete('feedbacks', item._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
