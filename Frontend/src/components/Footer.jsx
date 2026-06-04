import { Heart, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
              <span className="text-xl font-bold tracking-tight">Digital Blood Donation Network</span>
            </div>
            <p className="text-gray-400 text-sm leading-7">
              Connecting donors with those in need. Our platform ensures a seamless, 
              fast, and reliable way to save lives through the power of community 
              and technology.
            </p>
          </div>

          {/* Important Links (Resources simplified) */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Quick Access</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <a href="/#home" className="text-gray-400 hover:text-white transition-colors">Home</a>
              <a href="/#instructions" className="text-gray-400 hover:text-white transition-colors">How It Works</a>
              <Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Contact Us</h3>
            <div className="flex flex-col gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-600" />
                <a href="tel:+15559111911" className="text-red-500 hover:underline">+1 (555) 911-1911</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-600" />
                <a href="mailto:info@blooddonation.org" className="hover:text-white transition-colors">info@blooddonation.org</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        {/* Centered Bottom Section */}
<div className="border-t border-gray-800 pt-8 mt-8 flex flex-col items-center justify-center gap-4">
  <p className="text-gray-500 text-sm text-center">
    &copy; 2026 Digital Blood Donation Network. Saving Lives, One Donation at a Time.
  </p>
</div>
      </div>
    </footer>
  );
}