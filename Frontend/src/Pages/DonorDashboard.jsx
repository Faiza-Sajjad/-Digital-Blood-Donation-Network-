import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Edit2, LogOut, Bell, MapPin, Phone, Upload, FileText, X, Calendar, Droplet, CheckCircle, ChevronRight, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const urgencyConfig = {
  High: { bg: '#fff1f1', text: '#e53e3e', dot: '#e53e3e', label: 'Critical' },
  Medium: { bg: '#fffbeb', text: '#d97706', dot: '#d97706', label: 'Moderate' },
  Low: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Routine' },
};

// Date format function — "2000-02-11T00:00:00.000Z" → "Feb 11, 2000"
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '—') return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return '—'; }
};

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [donorInfo, setDonorInfo] = useState({ id: '', fullName: '', email: '', phone: '', bloodType: '', address: '', dateOfBirth: '' });
  const [requests, setRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [editData, setEditData] = useState({ name: '', phone: '', city: '', bloodGroup: '', dateOfBirth: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate('/'); return; }
    try {
      const profileRes = await fetch("https://digital-blood-donation-network.onrender.com/api/donor/me", { headers: { 'Authorization': `Bearer ${token}` } });
      const profileData = await profileRes.json();
      if (profileData.success) {
        const u = profileData.user;
        setDonorInfo({ id: u._id, fullName: u.name, email: u.email, phone: u.phone || '—', bloodType: u.bloodGroup || '?', address: u.city || '—', dateOfBirth: u.dateOfBirth || '—' });
        // Edit form ke liye date ko YYYY-MM-DD format mein rakhna zaroori hai
        const dobForInput = u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '';
        setEditData({ name: u.name, phone: u.phone || '', city: u.city || '', bloodGroup: u.bloodGroup || '', dateOfBirth: dobForInput });
      }
      const reqRes = await fetch("https://digital-blood-donation-network.onrender.com/api/requests/all");
      const reqData = await reqRes.json();
      if (reqData.success) setRequests(reqData.requests);
    } catch { toast.error("Error loading data"); }
    finally { setLoadingRequests(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Socket.IO — real-time notifications
  useEffect(() => {
    // userId — donorInfo se milega ya localStorage se
    const userId = localStorage.getItem("userId") || localStorage.getItem("token") ? null : null;

    const socket = io("https://digital-blood-donation-network.onrender.com");

    // fetchData ke baad id milegi — 
    const registerSocket = () => {
      const uid = localStorage.getItem("userId");
      if (uid) {
        socket.emit("register", uid);
        console.log("Socket registered with userId:", uid);
      }
    };

    socket.on("connect", registerSocket);

    socket.on("urgent_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast.error(notif.message, {
        duration: 8000,
        description: `Patient: ${notif.patientName} | Contact: ${notif.phone}`,
      });
      if (Notification.permission === "granted") {
        new Notification("🚨 Urgent Blood Request!", {
          body: notif.message,
          icon: "/favicon.ico"
        });
      }
    });

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => socket.disconnect();
  }, []);

  // GPS location detect 
  const detectMyLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS support nahi hai'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          if (city) {
            setEditData(prev => ({ ...prev, city, lat: latitude, lng: longitude }));
            toast.success(`Location detect ho gayi: ${city} 📍`);
          } else {
            toast.error('City detect nahi hui, manually likhein');
          }
        } catch { toast.error('Location service error'); }
        finally { setGpsLoading(false); }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) toast.error('GPS permission allow karein');
        else toast.error('Location detect nahi hui');
      },
      { timeout: 10000 }
    );
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`https://digital-blood-donation-network.onrender.com/api/auth/update-profile/${donorInfo.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) { toast.success("Profile updated!"); setIsEditing(false); fetchData(); }
    } catch { toast.error("Update failed"); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImage(reader.result); toast.success('Photo updated!'); };
      reader.readAsDataURL(file);
    }
  };

  // fields
  const handleDonationRequest = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      patientName: fd.get('patientName'),
      bloodGroup: fd.get('bloodGroup'),
      units: fd.get('units'),
      urgency: fd.get('urgency'),
      phone: fd.get('phone'),
      hospital: fd.get('hospital'),
      city: fd.get('hospital'), // Request model mein city required 
      additionalNotes: fd.get('notes'),
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://digital-blood-donation-network.onrender.com/api/requests/create", {
        method: "POST", headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { toast.success('Request submitted!'); setShowDonationForm(false); fetchData(); }
      else toast.error(data.message || "Submission failed");
    } catch { toast.error("Request failed"); }
  };

  const S = {
    page: { minHeight: '100vh', background: '#f6f6f6', fontFamily: "'Sora', sans-serif" },
    header: { background: '#fff', borderBottom: '1px solid #efefef', padding: '0 28px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    logoIcon: { width: 32, height: 32, background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' },
logoText: { fontSize: 13, fontWeight: 800, color: '#111', letterSpacing: '0.3px' },
    logoSub: { fontSize: 11, color: '#bbb', fontWeight: 500 },
    signOutBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#f8f8f8', border: '1px solid #ececec', borderRadius: 10, padding: '8px 15px', fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer' },
    layout: { maxWidth: 1080, margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: '288px 1fr', gap: 22 },
    card: { background: '#fff', border: '1px solid #efefef', borderRadius: 18 },
    sectionLabel: { fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 },
    infoRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid #f5f5f5' },
    infoIcon: { width: 30, height: 30, background: '#fff5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    infoLabel: { fontSize: 10, color: '#c0c0c0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: 13, fontWeight: 600, color: '#222', marginTop: 1 },
    inputField: { width: '100%', border: '1.5px solid #efefef', borderRadius: 11, padding: '10px 13px', fontSize: 13, outline: 'none', background: '#fafafa', fontFamily: "'Sora', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' },
    btnPrimary: { width: '100%', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 },
    btnGhost: { width: '100%', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Sora', sans-serif" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        .input-focus:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); background: #fff !important; }
        .req-card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 18px; transition: all 0.18s; }
        .req-card:hover { border-color: #fca5a5; box-shadow: 0 6px 24px rgba(239,68,68,0.08); transform: translateY(-2px); }
        .respond-btn { width: 100%; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca; border-radius: 10px; padding: 9px 14px; font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Sora',sans-serif; display:flex; align-items:center; justify-content:center; gap:5px; transition: all 0.18s; }
        .respond-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .tab-btn { padding: 7px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; font-family: 'Sora',sans-serif; }
        .tab-on { background: #ef4444; color: #fff; }
        .tab-off { background: transparent; color: #aaa; }
        .tab-off:hover { color: #333; background: #f0f0f0; }
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; animation: fin 0.2s ease; }
        .modal-box { background:#fff; border-radius:22px; padding:32px; max-width:480px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,0.14); animation: sup 0.22s ease; max-height:90vh; overflow-y:auto; }
        @keyframes fin { from{opacity:0} to{opacity:1} }
        @keyframes sup { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .skel { background: linear-gradient(90deg,#f2f2f2 25%,#eaeaea 50%,#f2f2f2 75%); background-size:200% 100%; animation:shim 1.4s infinite; border-radius:8px; }
        @keyframes shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 13px center; padding-right:34px !important; }
        textarea { resize:none; }
        .blood-type { font-family:'JetBrains Mono',monospace; }
      `}</style>

      <div style={S.page}>

        {/* ── Header ── */}
       <div style={S.logo}>
  <div style={S.logoIcon}><Heart size={16} color="#ef4444" strokeWidth={2.2} /></div>
  <div>
    <div style={S.logoText}>DBDN</div>
    <div style={S.logoSub}>Donor Portal</div>
  </div>
</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifPanel(v => !v)}
              style={{ position: 'relative', background: notifications.length > 0 ? '#fff1f1' : '#f8f8f8', border: `1px solid ${notifications.length > 0 ? '#fecaca' : '#ececec'}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Bell size={16} color={notifications.length > 0 ? '#ef4444' : '#666'} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            <button style={S.signOutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <div style={S.layout}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Avatar card */}
            <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
                {profileImage
                  ? <img src={profileImage} alt="Profile" style={{ width: 84, height: 84, borderRadius: 18, objectFit: 'cover', border: '3px solid #f0f0f0' }} />
                  : <div style={{ width: 84, height: 84, borderRadius: 18, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '2px dashed #fca5a5' }}>
                    <User size={34} color="#ef4444" />
                  </div>
                }
                <label style={{ position: 'absolute', bottom: -5, right: -5, background: '#ef4444', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', boxShadow: '0 2px 10px rgba(239,68,68,0.35)' }}>
                  <Upload size={12} color="#fff" />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </div>

              <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 3 }}>{donorInfo.fullName || 'Loading…'}</div>
              <div style={{ fontSize: 12, color: '#bbb', fontWeight: 500, marginBottom: 14 }}>{donorInfo.email}</div>

              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff', borderRadius: 10, padding: '8px 20px' }}>
                <span className="blood-type" style={{ fontSize: 22, fontWeight: 700 }}>{donorInfo.bloodType}</span>
              </div>
            </div>

            {/* Info / Edit card */}
            <div style={{ ...S.card, padding: '6px 20px 16px' }}>
              {isEditing ? (
                <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 2 }}>Edit Profile</div>
                  {[
                    { key: 'phone', ph: 'Phone number', type: 'text' },
                  ].map(f => (
                    <input key={f.key} type={f.type} className="input-focus" style={S.inputField} value={editData[f.key]} onChange={e => setEditData({ ...editData, [f.key]: e.target.value })} placeholder={f.ph} />
                  ))}
                  {/* City + GPS */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" className="input-focus" style={{ ...S.inputField, flex: 1 }}
                      value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} placeholder="City" />
                    <button type="button" onClick={detectMyLocation} disabled={gpsLoading}
                      style={{ background: gpsLoading ? '#f0f0f0' : '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 11, padding: '0 12px', cursor: gpsLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>
                      <Navigation size={14} />
                      {gpsLoading ? '...' : 'GPS'}
                    </button>
                  </div>
                  <input type="date" className="input-focus" style={S.inputField} value={editData.dateOfBirth} onChange={e => setEditData({ ...editData, dateOfBirth: e.target.value })} />
                  <select className="input-focus" style={S.inputField} value={editData.bloodGroup} onChange={e => setEditData({ ...editData, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button style={{ ...S.btnPrimary, marginTop: 4 }} onClick={handleUpdateProfile}>
                    <CheckCircle size={14} /> Save Changes
                  </button>
                  <button style={S.btnGhost} onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  {[
                    { icon: <Phone size={13} color="#ef4444" />, label: 'Phone', value: donorInfo.phone },
                    { icon: <MapPin size={13} color="#ef4444" />, label: 'City', value: donorInfo.address },
                    { icon: <Calendar size={13} color="#ef4444" />, label: 'Date of Birth', value: formatDate(donorInfo.dateOfBirth) },
                  ].map((row, i) => (
                    <div key={i} style={{ ...S.infoRow, ...(i === 2 ? { borderBottom: 'none' } : {}) }}>
                      <div style={S.infoIcon}>{row.icon}</div>
                      <div>
                        <div style={S.infoLabel}>{row.label}</div>
                        <div style={S.infoValue}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                  <button
                    style={{ ...S.btnGhost, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={13} /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* CTA Banner */}
            <div style={{ background: 'linear-gradient(130deg,#ef4444 0%,#991b1b 100%)', borderRadius: 18, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Need Blood?</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: 500, lineHeight: 1.5 }}>Submit a request and connect with nearby donors instantly.</div>
              </div>
              <button
                onClick={() => setShowDonationForm(true)}
                style={{ background: '#fff', color: '#ef4444', border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, fontFamily: "'Sora',sans-serif", transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <FileText size={15} /> Make Request
              </button>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4, background: '#f0f0f0', borderRadius: 11, padding: 4 }}>
                {[['requests', '🩸 Live Requests'], ['history', '📋 My History']].map(([id, label]) => (
                  <button key={id} className={`tab-btn ${activeTab === id ? 'tab-on' : 'tab-off'}`} onClick={() => setActiveTab(id)}>{label}</button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#bbb', fontWeight: 600 }}>{requests.length} active</span>
            </div>

            {/* Cards Grid */}
            {loadingRequests ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 18 }}>
                    <div className="skel" style={{ height: 44, width: 44, borderRadius: 11, marginBottom: 12 }} />
                    <div className="skel" style={{ height: 13, width: '65%', marginBottom: 8 }} />
                    <div className="skel" style={{ height: 11, width: '45%', marginBottom: 16 }} />
                    <div className="skel" style={{ height: 36, borderRadius: 10 }} />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div style={{ ...S.card, padding: 52, textAlign: 'center' }}>
                <Droplet size={38} color="#fca5a5" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>No active requests</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 4, fontWeight: 500 }}>Check back soon for blood requests near you.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {requests.map(req => {
                  const urg = urgencyConfig[req.urgency] || urgencyConfig.Low;
                  return (
                    <div key={req._id} className="req-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ background: '#fff5f5', border: '2px solid #fecaca', borderRadius: 11, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="blood-type" style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{req.bloodGroup}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{req.patientName}</div>
                            <div style={{ fontSize: 11, color: '#bbb', fontWeight: 500, marginTop: 2 }}>{req.hospital}</div>
                          </div>
                        </div>
                        <div style={{ background: urg.bg, color: urg.text, borderRadius: 7, padding: '4px 9px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: urg.dot, display: 'inline-block' }} />
                          {urg.label}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        {[['UNITS', req.units || '—'], ['DATE', req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—']].map(([l, v]) => (
                          <div key={l} style={{ flex: 1, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 9, padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: 9, color: '#c0c0c0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginTop: 2 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <button className="respond-btn" onClick={() => toast.success("Details shared with Seeker!")}>
                        Respond Now <ChevronRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showDonationForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowDonationForm(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#111', fontFamily: "'Sora',sans-serif" }}>New Blood Request</div>
                <div style={{ fontSize: 12, color: '#bbb', marginTop: 3, fontWeight: 500, fontFamily: "'Sora',sans-serif" }}>Fill in the details below</div>
              </div>
              <button onClick={() => setShowDonationForm(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}>
                <X size={15} color="#666" />
              </button>
            </div>

            <form onSubmit={handleDonationRequest} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

              {/* Patient Name */}
              <div>
                <label style={S.sectionLabel}>Patient Name</label>
                <input type="text" name="patientName" required className="input-focus" style={S.inputField} placeholder="Enter patient full name" />
              </div>

              {/* Blood Group + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                <div>
                  <label style={S.sectionLabel}>Blood Type Needed</label>
                  <select name="bloodGroup" className="input-focus" style={S.inputField}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.sectionLabel}>Contact Number</label>
                  <input type="text" name="phone" required className="input-focus" style={S.inputField} placeholder="03xx-xxxxxxx" />
                </div>
              </div>

              {/* Hospital */}
              <div>
                <label style={S.sectionLabel}>Hospital & Area Address</label>
                <input type="text" name="hospital" required className="input-focus" style={S.inputField} placeholder="e.g. Mayo Hospital, Lahore" />
              </div>

              {/* Units + Urgency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                <div>
                  <label style={S.sectionLabel}>Units Required</label>
                  <input type="number" name="units" min="1" required className="input-focus" style={S.inputField} placeholder="e.g. 2" />
                </div>
                <div>
                  <label style={S.sectionLabel}>Urgency</label>
                  <select name="urgency" className="input-focus" style={S.inputField}>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={S.sectionLabel}>Additional Notes</label>
                <textarea name="notes" className="input-focus" style={{ ...S.inputField, resize: 'none' }} rows={3} placeholder="Patient condition, any extra details…" />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" style={S.btnGhost} onClick={() => setShowDonationForm(false)}>Cancel</button>
                <button type="submit" style={S.btnPrimary}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── NOTIFICATION PANEL ── */}
      {showNotifPanel && (
        <div style={{ position: 'fixed', top: 70, right: 20, width: 360, maxHeight: '70vh', overflowY: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0', zIndex: 100 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>🔔 Notifications ({notifications.length})</span>
            <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', fontSize: 11, color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Clear All</button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#bbb', fontSize: 13 }}>No notifications yet</div>
          ) : (
            notifications.map((notif, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f9f9f9', background: i === 0 ? '#fff5f5' : '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>{notif.message}</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>👤 Patient: {notif.patientName}</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>🏥 {notif.hospital}</div>
                <div style={{ fontSize: 11, color: '#666' }}>📞 {notif.phone}</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>{new Date(notif.timestamp).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
} 
