import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, User, Edit2, LogOut, Bell, MapPin, Phone, 
  Upload, FileText, X, Calendar, Droplet, CheckCircle, 
  ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const urgencyConfig = {
  High: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Critical' },
  Medium: { bg: '#fffbe8', text: '#d97706', border: '#fef3c7', label: 'Moderate' },
  Low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'Routine' },
};

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
        const dobForInput = u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '';
        setEditData({ name: u.name, phone: u.phone || '', city: u.city || '', bloodGroup: u.bloodGroup || '', dateOfBirth: dobForInput });
      }
      const reqRes = await fetch("https://digital-blood-donation-network.onrender.com/api/requests/all");
      const reqData = await reqRes.json();
      if (reqData.success) setRequests(reqData.requests);
    } catch { 
      toast.error("Error loading data"); 
    } finally { 
      setLoadingRequests(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const socket = io("https://digital-blood-donation-network.onrender.com");

    const registerSocket = () => {
      const uid = localStorage.getItem("userId");
      if (uid) socket.emit("register", uid);
    };

    socket.on("connect", registerSocket);
    socket.on("urgent_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast.error(notif.message, {
        duration: 8000,
        description: `Patient: ${notif.patientName} | Contact: ${notif.phone}`,
      });
    });

    return () => socket.disconnect();
  }, []);

  const detectMyLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS support missing'); return; }
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
            toast.success(`Location detected: ${city}`);
          } else {
            toast.error('City not detected');
          }
        } catch { toast.error('Location error'); }
        finally { setGpsLoading(false); }
      },
      () => {
        setGpsLoading(false);
        toast.error('Location detection failed');
      },
      { timeout: 10000 }
    );
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`https://digital-blood-donation-network.onrender.com/api/auth/update-profile/${donorInfo.id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
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
      city: fd.get('hospital'),
      additionalNotes: fd.get('notes'),
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://digital-blood-donation-network.onrender.com/api/requests/create", {
        method: "POST", 
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { toast.success('Request submitted!'); setShowDonationForm(false); fetchData(); }
      else toast.error(data.message || "Submission failed");
    } catch { toast.error("Request failed"); }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; }

        .dashboard-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .input-style {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          background: #ffffff;
        }

        .btn-primary {
          background: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-ghost {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .req-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
        }

        .respond-btn {
          width: 100%;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 9px;
          padding: 9px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 50;
        }
        .modal-box {
          background: #ffffff;
          border-radius: 18px;
          padding: 24px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .dashboard-container { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .requests-grid { grid-template-columns: 1fr; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .banner-box { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', height: 64, position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="#ef4444" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>DBDN</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Donor Hub</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setShowNotifPanel(v => !v)}
                style={{
                  position: 'relative',
                  background: notifications.length > 0 ? '#fef2f2' : '#ffffff',
                  border: `1px solid ${notifications.length > 0 ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  cursor: 'pointer'
                }}
              >
                <Bell size={16} color={notifications.length > 0 ? '#dc2626' : '#64748b'} />
              </button>

              <button className="btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { localStorage.clear(); navigate('/'); }}>
                <LogOut size={14} /> <span style={{ fontSize: 13 }}>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1' }}>
                    <User size={32} color="#94a3b8" />
                  </div>
                )}
                <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#ef4444', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex', color: '#fff' }}>
                  <Upload size={12} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{donorInfo.fullName || 'Loading...'}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 }}>{donorInfo.email}</div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '4px 14px' }}>
                <Droplet size={14} fill="#dc2626" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{donorInfo.bloodType}</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Edit Profile</div>
                  <input type="text" className="input-style" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="Phone number" />
                  
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" className="input-style" value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} placeholder="City" />
                    <button type="button" onClick={detectMyLocation} disabled={gpsLoading} className="btn-ghost" style={{ padding: '0 10px' }}>
                      GPS
                    </button>
                  </div>

                  <input type="date" className="input-style" value={editData.dateOfBirth} onChange={e => setEditData({ ...editData, dateOfBirth: e.target.value })} />
                  <select className="input-style" value={editData.bloodGroup} onChange={e => setEditData({ ...editData, bloodGroup: e.target.value })}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>

                  <button className="btn-primary" onClick={handleUpdateProfile}><CheckCircle size={14} /> Save</button>
                  <button className="btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Phone size={14} color="#64748b" />
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>PHONE</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{donorInfo.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MapPin size={14} color="#64748b" />
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>CITY</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{donorInfo.address}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Calendar size={14} color="#64748b" />
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>DATE OF BIRTH</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(donorInfo.dateOfBirth)}</div>
                    </div>
                  </div>

                  <button className="btn-ghost" style={{ width: '100%', marginTop: 6 }} onClick={() => setIsEditing(true)}>
                    <Edit2 size={13} /> Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="banner-box" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>Need Urgent Blood?</div>
                <div style={{ fontSize: 13, color: '#fca5a5' }}>Create a request and broadcast it instantly.</div>
              </div>
              <button onClick={() => setShowDonationForm(true)} style={{ background: '#ffffff', color: '#dc2626', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} /> Make Request
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', borderRadius: 10, padding: 3 }}>
                {[['requests', 'Live Requests'], ['history', 'My History']].map(([id, label]) => (
                  <button 
                    key={id} 
                    onClick={() => setActiveTab(id)}
                    style={{
                      border: 'none',
                      background: activeTab === id ? '#ffffff' : 'transparent',
                      color: activeTab === id ? '#0f172a' : '#64748b',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{requests.length} Available</span>
            </div>

            {loadingRequests ? (
              <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
            ) : requests.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <Droplet size={36} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No active requests right now</div>
              </div>
            ) : (
              <div className="requests-grid">
                {requests.map(req => {
                  const urg = urgencyConfig[req.urgency] || urgencyConfig.Low;
                  return (
                    <div key={req._id} className="req-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>{req.bloodGroup}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{req.patientName}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{req.hospital}</div>
                          </div>
                        </div>
                        <span style={{ background: urg.bg, color: urg.text, border: `1px solid ${urg.border}`, borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>
                          {urg.label}
                        </span>
                      </div>

                      <button className="respond-btn" onClick={() => toast.success("Details shared!")}>
                        Respond Now <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showDonationForm && (
          <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowDonationForm(false)}>
            <div className="modal-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>New Request</div>
                <button onClick={() => setShowDonationForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6 }}>
                  <X size={16} color="#64748b" />
                </button>
              </div>

              <form onSubmit={handleDonationRequest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="text" name="patientName" required className="input-style" placeholder="Patient Name" />
                
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select name="bloodGroup" className="input-style">
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="text" name="phone" required className="input-style" placeholder="Phone" />
                </div>

                <input type="text" name="hospital" required className="input-style" placeholder="Hospital Name" />

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="number" name="units" min="1" defaultValue="1" required className="input-style" />
                  <select name="urgency" className="input-style">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <textarea name="notes" className="input-style" rows={3} placeholder="Notes" />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowDonationForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNotifPanel && (
          <div style={{ position: 'fixed', top: 70, right: 20, width: 320, background: '#ffffff', borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 100, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Notifications</div>
            {notifications.length === 0 ? <div style={{ fontSize: 12, color: '#94a3b8' }}>No alerts</div> : notifications.map((n, i) => <div key={i} style={{ fontSize: 12 }}>{n.message}</div>)}
          </div>
        )}
      </div>
    </>
  );
}
