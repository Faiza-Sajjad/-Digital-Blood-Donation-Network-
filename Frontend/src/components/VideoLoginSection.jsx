import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import DonationVideo from '../assets/blood-donation.mp4';

export default function VideoLoginSection() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (formData) => {
    try {
      // Signup mein OTP verify karna hai — /register route pe otp bhi jayega
      const endpoint = formData.isSignUp 
  ? "https://digital-blood-donation-network.onrender.com/api/auth/register" 
  : "https://digital-blood-donation-network.onrender.com/api/auth/login";
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CHANGED: role ab sirf formData se aayega (jo user ne modal ke andar select kiya),
        // pehle yahan "role: selectedRole" likh kar usko overwrite kar diya jata tha —
        // isse modal ke andar role badalne wala naya feature kaam nahi karta tha.
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userId", data.user.id);
        setShowLoginModal(false);
        toast.success(`Welcome ${data.user.name}!`);
        if (data.user.role === 'donor') navigate('/donor-dashboard');
        else if (data.user.role === 'seeker') navigate('/seeker-dashboard');
        else if (data.user.role === 'admin') navigate('/admin-dashboard');
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error("Server is currently unreachable. Please try again later.");
    }
  };

  return (
    <>
      <section id="login" className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Video Part */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <video className="w-full h-auto block" autoPlay loop muted playsInline>
                  <source src={DonationVideo} type="video/mp4" />
                </video>
              </div>
            </motion.div>

            {/* Button Part — CHANGED. */}
            <div className="space-y-6">
  <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>

  {/* Quote / Ayat Box */}
  <div className="bg-red-50 border-l-4 border-red-600 rounded-r-xl px-6 py-5">
    <p className="text-gray-700 italic leading-relaxed">
      "Whoever saves one life, it is as if he has saved all of mankind."
    </p>
    <p className="text-sm text-red-600 font-semibold mt-2">
      — Surah Al-Ma'idah, 5:32
    </p>
  </div>

  {/* Login Button  */}
  <button
    onClick={() => handleRoleSelect('donor')}
    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
  >
    Login to Continue
  </button>
</div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            role={selectedRole}
            onClose={() => setShowLoginModal(false)}
            onSubmit={handleLoginSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
