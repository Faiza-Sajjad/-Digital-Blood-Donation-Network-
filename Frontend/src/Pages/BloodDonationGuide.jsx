import { Link } from 'react-router-dom';
import {
  Heart, CheckCircle, Clock, Droplet, UserCheck, AlertTriangle, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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
  // Full compatibility table 
  const compatibilityData = [
    { type: 'O−', note: 'Universal Donor', give: 'Everyone', receive: 'O−' },
    { type: 'O+', note: 'Common Donor', give: 'O+, A+, B+, AB+', receive: 'O+, O−' },
    { type: 'A−', note: 'Rh-Negative Donor', give: 'A−, A+, AB−, AB+', receive: 'A−, O−' },
    { type: 'A+', note: 'Standard Donor', give: 'A+, AB+', receive: 'A+, A−, O+, O−' },
    { type: 'B−', note: 'Rh-Negative Donor', give: 'B−, B+, AB−, AB+', receive: 'B−, O−' },
    { type: 'B+', note: 'Standard Donor', give: 'B+, AB+', receive: 'B+, B−, O+, O−' },
    { type: 'AB−', note: 'Rh-Negative Donor', give: 'AB−, AB+', receive: 'AB−, A−, B−, O−' },
    { type: 'AB+', note: 'Universal Recipient', give: 'AB+ only', receive: 'Everyone' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/*  header — informative */}
      <section className="bg-white border-b border-gray-100 py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-5">
            <Droplet size={14} className="text-red-600" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Blood Donation Guide</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            A Simple Guide Before You Donate
          </h1>
          <p className="text-gray-500 leading-relaxed">
            A quick, easy-to-understand overview of who can donate, when to wait,
            and how blood types match with each other.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Eligibility & Deferrals */}
        <motion.section
          className="grid md:grid-cols-2 gap-6 mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Who Can Donate */}
          <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Who Can Donate</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Age', val: '18 to 65 years old' },
                { label: 'Weight', val: 'At least 50kg' },
                { label: 'Gap between donations', val: 'A minimum of 56 days' },
                { label: 'Health', val: 'Feeling well, no active illness' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>{item.label}:</strong> {item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* When to Wait */}
          <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">When You Should Wait</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Recently unwell', val: 'Wait at least 24 hours after symptoms clear' },
                { label: 'New tattoo/piercing', val: 'Wait 3–6 months, depending on the facility' },
                { label: 'Recently gave birth', val: 'Wait about 6 weeks after delivery' },
                { label: 'Recent travel', val: 'May vary depending on the area visited' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700"><strong>{item.label}:</strong> {item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Compatibility Table — full 8 blood groups */}
        <motion.section
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="p-7 border-b border-gray-100 flex items-center gap-3">
            <Droplet className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Blood Type Compatibility</h3>
              <p className="text-sm text-gray-500 mt-0.5">Who each blood type can safely give to and receive from</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-6 py-3 font-medium">Blood Type</th>
                  <th className="px-6 py-3 font-medium">Can Donate To</th>
                  <th className="px-6 py-3 font-medium">Can Receive From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {compatibilityData.map((row) => (
                  <tr key={row.type} className="hover:bg-red-50/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold text-sm">
                        {row.type}
                      </span>
                      <span className="block text-xs text-gray-400 mt-1">{row.note}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{row.give}</td>
                    <td className="px-6 py-3.5 text-gray-600">{row.receive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/*  closing note */}
        <motion.div
          className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Heart className="w-10 h-10 mx-auto mb-3 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Help Someone in Need?</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto text-sm">
            If you meet the requirements above, you can register as a donor
            and be notified when someone nearby needs your blood type.
          </p>
          <Link
           href="/#login"
            className="bg-red-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-red-700 transition-all inline-block text-sm"
          >
            Register as a Donor
          </Link>
        </motion.div>

        {/* Quiet disclaimer */}
        <div className="flex items-start gap-2 mt-6 text-xs text-gray-400 max-w-2xl mx-auto text-center justify-center">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>This guide is for general awareness only. Please consult a medical professional or your local blood bank for personalized advice.</p>
        </div>

      </div>
      <Footer />
    </div>
  );
}
