import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FeedbackSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Thank you for your feedback!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send feedback');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    }
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Feedback Form - Slides in from Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Share Your Feedback
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              We value your opinion. Let us know how we can improve our service and make blood donation more accessible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-gray-700 mb-2 font-medium group-focus-within:text-red-600 transition-colors">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="group">
                <label className="block text-gray-700 mb-2 font-medium group-focus-within:text-red-600 transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="group">
                <label className="block text-gray-700 mb-2 font-medium group-focus-within:text-red-600 transition-colors">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help?"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 group font-semibold"
              >
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5, y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Send className="w-5 h-5" />
                </motion.span>
                Send Feedback
              </motion.button>
            </form>
          </motion.div>

          {/* Motivational Text - Slides in from Right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="bg-red-50 p-10 md:p-14 rounded-3xl relative overflow-hidden border border-red-100 shadow-inner"
          >
            {/* Decorative Background Element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100 rounded-full opacity-50 blur-3xl" />

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 relative z-10">
              Your Voice Matters
            </h3>

            <div className="space-y-6 text-gray-700 text-lg relative z-10">
              <p>
                Every piece of feedback helps us create a better experience for donors and recipients alike.
              </p>
              <p>
                Whether it's a suggestion, a compliment, or a concern, we're here to listen and improve.
              </p>
              <p>
                Together, we can make blood donation easier, faster, and more accessible for everyone.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-10 pt-8 border-t border-red-200"
              >
                <p className="text-red-600 italic font-medium">
                  "The best charity is that given when one is in need themselves."
                  <br />
                  <span className="text-gray-500 text-sm not-italic mt-2 block">
                    - Prophet Muhammad (ﷺ)
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}