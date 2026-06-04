// HomePage.jsx (Wapis purana wala)
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import InstructionSection from "../components/IstructionSection";
import FeedbackSection from "../components/FeedbackSection";
import ContactUs from "../components/ContactSection";
import Footer from "../components/Footer";

const HomePage = ({ children }) => {
  return (
    <>
      <Navbar />
      <Hero />
      {children}
      <InstructionSection />
      <FeedbackSection />
      <ContactUs />
      <Footer />
    </>
  );
};
export default HomePage;