import { Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@blooddonation.org',
      link: 'mailto:info@blooddonation.org',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Get In Touch
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Contact our support team for any inquiries or assistance.
          </p>
        </motion.div>

        {/* Flex container to keep boxes smaller and centered */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 max-w-4xl mx-auto">
          {contactInfo.map((info, index) => (
            <motion.a
              key={index}
              href={info.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="w-full md:w-72 bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors duration-300">
                <info.icon className="w-5 h-5 text-red-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  {info.title}
                </p>
                <p className="text-gray-700 font-semibold group-hover:text-red-600 transition-colors">
                  {info.content}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center">
            <p className="text-sm font-medium text-gray-500 mb-4">Emergency Blood Request?</p>
            <motion.a
              href="tel:+15551234567"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100"
            >
              <Phone className="w-4 h-4" />
              Call Emergency Hotline
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}