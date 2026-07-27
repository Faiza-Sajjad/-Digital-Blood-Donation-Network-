import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner'; // 1. Pehle import karein

import HomePage from './Pages/HomePage';
import SeekerDashboard from './Pages/BloodSeekerDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import DonorDashboard from './Pages/DonorDashboard';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import VideoLoginSection from './components/VideoLoginSection';
import BloodDonationGuide from './Pages/BloodDonationGuide';
function App() {
  return (
    <>
      {/* 2. Toaster ko Routes se bahar yahan rakhein */}
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage>
              <VideoLoginSection />
            </HomePage>
          }
        />
        <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/blood-donation-guide" element={<BloodDonationGuide />} />
      </Routes>
    </>
  );
}

export default App;
