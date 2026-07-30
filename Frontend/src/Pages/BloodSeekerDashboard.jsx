import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, LogOut, Droplet, Phone, MapPin, Plus, Navigation, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PostRequestModal from '../components/PostRequestModal';
import { io } from 'socket.io-client';

export default function BloodSeekerDashboard() {
  const navigate = useNavigate();
  const [searchBloodType, setSearchBloodType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seekerCoords, setSeekerCoords] = useState({ lat: null, lng: null });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Token check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); }
  }, []);

  // GPS detect
  const detectMyLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS support is not available.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setSeekerCoords({ lat: latitude, lng: longitude });
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          if (city) { setSearchLocation(city); toast.success(`Location: ${city} 📍`); }
          else toast.error('Unable to detect city');
        } catch { toast.error('Location error'); }
        finally { setGpsLoading(false); }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) toast.error('Allow GPS permission');
        else toast.error('Location not detected');
      },
      { timeout: 10000 }
    );
  };

  const fetchDonors = async () => {
    setLoading(true);
    try {
      let url = `https://digital-blood-donation-network.onrender.com/api/donor/search?bloodGroup=${encodeURIComponent(searchBloodType)}&city=${encodeURIComponent(searchLocation)}`;
      if (seekerCoords.lat && seekerCoords.lng) {
        url += `&lat=${seekerCoords.lat}&lng=${seekerCoords.lng}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setDonors(data.donors);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchDonors(), 400);
    return () => clearTimeout(timer);
  }, [searchBloodType, searchLocation]);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
            <span className="text-2xl font-bold text-gray-900">Seeker<span className="text-red-600">Portal</span></span>
          </Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 hover:bg-red-50 rounded-full text-gray-600">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Blood Group</label>
              <select className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl p-3 outline-none font-bold"
                value={searchBloodType} onChange={(e) => setSearchBloodType(e.target.value)}>
                <option value="">All Groups</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Location</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter city..." className="flex-1 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl p-3 outline-none font-bold"
                  value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} />
                <button onClick={detectMyLocation} disabled={gpsLoading}
                  className="bg-red-50 border-2 border-red-100 text-red-600 font-bold px-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50">
                  <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                  {gpsLoading ? '...' : 'GPS'}
                </button>
              </div>
            </div>
            <div className="md:col-span-3">
              <button onClick={() => setShowRequestForm(true)} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 shadow-lg transition-all">
                <Plus className="inline mr-2" /> POST REQUEST
              </button>
            </div>
          </div>
        </div>

        {/* Donor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton loading cards
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))
          ) : (
            donors.map((donor) => (
              <motion.div
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={donor._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center font-black text-red-600 text-lg">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{donor.name}</h3>
                    <span className="text-green-600 text-[10px] font-black tracking-wider">● AVAILABLE</span>
                  </div>
                  {/* Distance badge */}
                  {donor.distance !== null && donor.distance !== undefined && (
                    <span className="ml-auto bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full border border-blue-100">
                      📍 {donor.distance} km
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-6 text-sm font-bold text-gray-500">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400 shrink-0" />{donor.city || 'Location not set'}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-400 shrink-0" />{donor.phone || 'Hidden'}</p>
                </div>
                <button onClick={() => setSelectedDonor(donor)}
                  className="block text-center w-full py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-red-600 transition-all">
                  CONTACT HERO
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && donors.length === 0 && (
          <div className="text-center py-20">
            <Droplet className="w-12 h-12 text-red-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No donors found</p>
            <p className="text-gray-300 text-sm mt-1">
              {searchBloodType || searchLocation
                ? 'Try changing blood group or city'
                : 'No donors registered yet'}
            </p>
          </div>
        )}
      </main>

      {showRequestForm && <PostRequestModal onClose={() => setShowRequestForm(false)} />}

      {/* ── CONTACT DONOR MODAL ── */}
      <AnimatePresence>
        {selectedDonor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={e => e.target === e.currentTarget && setSelectedDonor(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative">
                <button onClick={() => setSelectedDonor(null)} className="absolute right-4 top-4 bg-white/20 rounded-full p-1.5">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-black text-xl">{selectedDonor.bloodGroup}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{selectedDonor.name}</h3>
                    <span className="text-red-100 text-xs font-bold">● VERIFIED DONOR</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                    <p className="font-bold text-gray-900">{selectedDonor.city || 'Not provided'}</p>
                  </div>
                  {selectedDonor.distance !== null && selectedDonor.distance !== undefined && (
                    <span className="ml-auto bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-full">
                      {selectedDonor.distance} km away
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <Phone className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contact</p>
                    <p className="font-bold text-gray-900">{selectedDonor.phone || 'Not provided'}</p>
                  </div>
                </div>
                <a href={`tel:${selectedDonor.phone}`}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg">
                  <Phone className="w-5 h-5" /> Call Now — {selectedDonor.phone}
                </a>
                <button onClick={() => setSelectedDonor(null)}
                  className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
