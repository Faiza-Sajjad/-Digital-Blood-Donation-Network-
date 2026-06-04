import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import React, { useEffect } from 'react'; 
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div><div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-24 max-w-4xl bg-white shadow-sm my-10 rounded-lg">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 mb-10 border-b pb-6">Effective Date: January 10, 2026</p>
        
        <div className="space-y-10 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold mb-4 text-red-600">1. Introduction</h2>
            <p>
              Welcome to the Digital Blood Donation Network. We are committed to protecting your personal 
              information and your right to privacy. This policy outlines how we handle your data when 
              you use our platform to facilitate life-saving blood donations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-red-600">2. Information We Collect</h2>
            <p className="mb-2 font-semibold">We collect the following "Sensitive Personal Information":</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Health Data:</strong> Blood type and donation eligibility status.</li>
              <li><strong>Contact Data:</strong> Full name, phone number, and email address.</li>
              <li><strong>Geolocation:</strong> Your city or district to connect you with nearby seekers/donors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-red-600">3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information. Your contact information is 
              only displayed to registered users who have a verified need for blood. By registering 
              as a donor, you acknowledge that your blood type and contact details will be searchable 
              within our secure network.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-red-600">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to maintain the safety of your personal 
              information. However, no method of transmission over the internet is 100% secure. We 
              encourage users to use unique passwords and notify us immediately of any suspicious activity.
            </p>
          </section>
<section>
  <h2 className="text-2xl font-bold mb-4 text-red-600">5. Limitation of Liability & User Responsibility</h2>
  <p className="mb-4">
    While we employ rigorous security protocols, the Digital Blood Donation Network acts solely as a 
    facilitator. Users acknowledge and agree to the following:
  </p>
  <ul className="list-disc ml-6 space-y-3">
    <li>
      <strong>Unauthorized Disclosure:</strong> The platform shall not be held liable for data 
      leakage or privacy breaches resulting from human error on the part of the user (e.g., 
      sharing account credentials or mishandling donor contact information).
    </li>
    <li>
      <strong>Interactions:</strong> We are not responsible for the conduct, actions, or 
      misuse of information by any user once contact is established outside of the platform.
    </li>
  </ul>
</section>

<section>
  <h2 className="text-2xl font-bold mb-4 text-red-600">6. Reporting & Community Safety</h2>
  <p>
    To maintain a safe environment, we provide a feedback and reporting mechanism. If you 
    encounter a user who is misusing data, providing false information, or behaving unprofessionally:
  </p>
  <div className="mt-4 bg-gray-50 p-4 border-l-4 border-gray-300">
    <p className="text-sm italic">
      "Users are encouraged to submit <strong>Feedback</strong> via our contact channels. 
      The Administration reserves the right to investigate reports and 
      <strong> permanently block or terminate</strong> any account found to be in violation 
      of our privacy standards or community safety guidelines."
    </p>
  </div>
</section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-red-600">5. User Rights and Data Deletion</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Update or correct your blood donation status at any time.</li>
              <li>Request the permanent deletion of your account and personal data.</li>
              <li>Opt-out of appearing in donor search results by setting your profile to "Inactive."</li>
            </ul>
          </section>

          <section className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <h2 className="text-xl font-bold mb-2 text-red-700">6. Medical Disclaimer</h2>
            <p className="text-sm text-red-800">
              This platform acts as a connector and does not provide medical services. Users are 
              responsible for verifying the identity of donors/seekers and must follow all 
              hospital protocols regarding blood screening and safety.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div></div>
  )
}

export default PrivacyPolicy