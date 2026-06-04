import { Link } from 'react-router-dom';
import {
  Heart, CheckCircle, AlertCircle, Clock, Activity, Shield, Users, Droplet,
  TrendingUp, Book, HelpCircle, ArrowLeft, UserCheck, Syringe, Hospital,
  ArrowRight, Stethoscope, FileText, AlertTriangle, Info, Award
} from 'lucide-react';
import { motion } from 'framer-motion'; // Standard import for framer-motion
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function BloodDonationGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="bg-linear-to-r from-red-600 to-red-700 text-white py-20 pt-32"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      >
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <motion.div className="max-w-3xl" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-4">
              <Book className="w-12 h-12 text-red-100" />
              <h1 className="text-4xl md:text-5xl font-bold">Life-Saving Guide</h1>
            </div>
            <p className="text-xl text-red-50">
              Everything you need to know about blood donation. Your contribution can save up to three lives with a single pint.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        
        {/* Eligibility & Disqualifications */}
        <motion.section 
          className="grid lg:grid-cols-2 gap-8 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Who Can Donate */}
          <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">General Eligibility</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Age', val: '17-65 years old' },
                { label: 'Weight', val: 'Minimum 50kg (110 lbs)' },
                { label: 'Frequency', val: 'Every 56 days (Whole Blood)' },
                { label: 'Health', val: 'Must feel well and be symptom-free' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-gray-700"><strong>{item.label}:</strong> {item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Deferrals */}
          <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Temporary Deferrals</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Illness', val: 'Wait 24 hours after fever/symptoms' },
                { label: 'Tattoos', val: 'Wait 3-6 months based on facility' },
                { label: 'Pregnancy', val: 'Wait 6 weeks after delivery' },
                { label: 'Travel', val: 'Depends on malaria-risk zones visited' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <p className="text-gray-700"><strong>{item.label}:</strong> {item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Compatibility Table Section */}
        <motion.section 
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="p-8 border-b bg-gray-50 flex items-center gap-3">
             <Droplet className="w-6 h-6 text-red-600" />
             <h3 className="text-2xl font-bold text-gray-900">Blood Type Compatibility Chart</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="p-4">Blood Type</th>
                  <th className="p-4">Can Give Blood To</th>
                  <th className="p-4">Can Receive Blood From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { type: 'O-', give: 'Universal Donor', receive: 'O-' },
                  { type: 'O+', give: 'O+, A+, B+, AB+', receive: 'O+, O-' },
                  { type: 'A-', give: 'A-, A+, AB-, AB+', receive: 'A-, O-' },
                  { type: 'AB+', give: 'AB+', receive: 'Universal Recipient' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-red-50 transition-colors">
                    <td className="p-4 font-bold text-red-600">{row.type}</td>
                    <td className="p-4 text-gray-700">{row.give}</td>
                    <td className="p-4 text-gray-700">{row.receive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Call to Action Card */}
        <motion.div 
          className="bg-red-600 rounded-3xl p-10 text-center text-white"
          whileInView={{ scale: [0.95, 1] }}
          transition={{ duration: 0.5 }}
        >
          <Award className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Start Your Hero's Journey</h2>
          <p className="text-red-100 mb-8 max-w-xl mx-auto">
            Your blood is the most precious gift you can give to another person—the gift of life.
          </p>
          <Link to="/donor-dashboard" className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all inline-block">
            Register as a Donor
          </Link>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}