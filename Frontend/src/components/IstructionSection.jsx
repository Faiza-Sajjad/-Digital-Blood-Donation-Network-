import { CheckCircle, UserPlus, Search, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstructionSection() {
  const instructions = [
    {
      icon: UserPlus,
      title: 'Register',
      description: 'Create your account as a donor or blood seeker with your basic information.',
    },
    {
      icon: Search,
      title: 'Search/Request',
      description: 'Donors can view blood requests. Seekers can search for available donors.',
    },
    {
      icon: CheckCircle,
      title: 'Connect',
      description: 'Connect with each other through the platform and coordinate donation.',
    },
    {
      icon: Heart,
      title: 'Save Lives',
      description: 'Complete the donation process and make a difference in someone\'s life.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, // Custom cubic-bezier for smoother feel
    },
  };

  return (
    <section id="instructions" className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          // viewport={{ once: false }} is the default,  can be explicit
          viewport={{ once: false, amount: 0.3 }} 
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6 rounded-full" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our platform makes it easy to connect blood donors with those in need. 
            Follow these simple steps to get started.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          // amount: 0.1 ensures the animation starts as soon as the top of the grid enters
          viewport={{ once: false, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {instructions.map((instruction, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -12, 
                transition: { duration: 0.3, ease: "easeOut" } 
              }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative"
            >
              {/* Step Number Badge */}
              <span className="absolute top-4 right-6 text-5xl font-bold text-gray-50 group-hover:text-red-50 transition-colors duration-300 pointer-events-none">
                0{index + 1}
              </span>

              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:bg-red-600 group-hover:rotate-6 transition-all duration-500">
                <instruction.icon className="w-10 h-10 text-red-600 group-hover:text-white transition-colors duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center relative z-10">
                {instruction.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed relative z-10">
                {instruction.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}