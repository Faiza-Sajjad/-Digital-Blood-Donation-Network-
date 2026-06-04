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
      const endpoint = formData.isSignUp ? "/api/auth/register" : "/api/auth/login";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: selectedRole
        })
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
      toast.error("Backend server nahi chal raha!");
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

            {/* Buttons Part */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
              {[
                { id: 'donor', label: 'Login as Blood Donor', color: 'bg-red-600' },
                { id: 'seeker', label: 'Login as Blood Seeker', color: 'bg-gray-800' },
                { id: 'admin', label: 'Login as Admin', color: 'bg-blue-600' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleRoleSelect(btn.id)}
                  className={`w-full ${btn.color} text-white px-8 py-4 rounded-xl font-semibold shadow-md`}
                >
                  {btn.label}
                </button>
              ))}
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