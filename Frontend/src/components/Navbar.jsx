import { Activity, List, XCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // Link import

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Helper function to handle correct path
  const getPath = (link) => {
    if (link === 'Resources') return '/blood-donation-guide';
    if (link === 'Home') return '/#home'; // Root slash 
    return `/#${link.toLowerCase()}`; // Root slash 
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Wrap with Link to go back home */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <Activity className="w-8 h-8 text-red-600 transition-transform duration-500 group-hover:rotate-360" />
            <span className="text-2xl text-gray-900 font-semibold tracking-tight">
              Digital Blood Donation <span className="text-red-600">Network </span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Resources', 'Instructions', 'Contact'].map((link) => (
              <a
                key={link}
                href={getPath(link)}
                className="relative text-gray-600 font-medium transition-colors duration-300 hover:text-red-600 group"
              >
                {link}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            
           
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all active:scale-90"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XCircle className="w-6 h-6 text-red-600" /> : <List className="w-6 h-6 text-red-600" />}
          </button>
        </div>

        {/* Mobile Menu with animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pb-6 flex flex-col gap-5"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {['Home', 'Resources', 'Instructions', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={getPath(link)}
                  className="text-lg text-gray-700 font-medium hover:text-red-600 px-2 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
             
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
