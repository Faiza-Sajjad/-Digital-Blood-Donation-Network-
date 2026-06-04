import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  // Container variants to stagger the children (h1, p, button)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <section id="home" className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-red-900/80 to-red-600/80 z-10"></div>

      {/* Corrected: Self-closing motion.img */}
      <motion.img
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        src="https://images.unsplash.com/photo-1683791895200-201c0c40310f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMGRvbmF0aW9uJTIwaGVyb3xlbnwxfHx8fDE3NjczMDc0Njl8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Blood Donation"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="relative z-20 text-center text-white px-4 max-w-4xl"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Save Lives Through Blood Donation
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl mb-8 font-light"
        >
          Every donation can save up to three lives. Be a hero today.
        </motion.p>

        <motion.div variants={itemVariants}>
          <motion.a 
            href="#login" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-semibold shadow-xl transition-colors"
          >
            Get Started
          </motion.a>
        </motion.div>
      </motion.div>
    </section> /* Correctly closing the section here */
  );
}