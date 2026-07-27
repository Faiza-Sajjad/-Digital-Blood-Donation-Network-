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
  // NOTE: "Guide" (renamed from "Resources") still routes to /blood-donation-guide — only the label changed.
  const getPath = (link) => {
    if (link === 'Guide') return '/blood-donation-guide';
    if (link === 'Home') return '/#home'; // Root slash
    return `/#${link.toLowerCase()}`; // Root slash
  };

  return (
    <nav className="bg-gradient-to-r from-white via-red-50/40 to-white backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-red-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo — flex-shrink-0 so it never squishes and pushes links off screen */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer flex-shrink-0">
            <Activity className="w-8 h-8 text-red-600 transition-transform duration-500 group-hover:rotate-360 flex-shrink-0" />
            <span className="text-2xl text-gray-900 font-semibold tracking-tight whitespace-nowrap">
              Digital Blood Donation <span className="text-red-600">Network </span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {['Home', 'Guide', 'Instructions', 'Contact'].map((link) => (
              <a
                key={link}
                href={getPath(link)}
                className="relative text-gray-600 font-medium transition-colors duration-300 hover:text-red-700 group whitespace-nowrap"
              >
                {link}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-red-50 transition-all active:scale-90 flex-shrink-0"
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
              {['Home', 'Guide', 'Instructions', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={getPath(link)}
                  className="text-lg text-gray-700 font-medium hover:text-red-700 px-2 transition-all"
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
