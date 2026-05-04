'use client';

import React, { useState, useEffect } from 'react';

export default function Terms() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. Eligibility' },
    { id: 'definitions', title: '3. Definitions' },
    { id: 'merchant-rights', title: '4. Merchant Rights' },
    { id: 'user-responsibilities', title: '5. Your Responsibilities' },
    { id: 'prohibited-actions', title: '6. Prohibited Actions' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'reviews', title: '8. Reviews Guidelines' },
    { id: 'governing-law', title: '9. Governing Law' },
    { id: 'grievance', title: '10. Grievance Redressal' },
    { id: 'disclaimer', title: '11. Disclaimer' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
          <nav className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Contents
            </p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block py-2 text-sm border-l-2 pl-4 ${
                  activeSection === section.id
                    ? 'border-pink-600 text-pink-600 font-semibold'
                    : 'border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <article className="lg:col-span-9 max-w-2xl">
          <h1 className="text-4xl font-black mb-6">Terms & Conditions</h1>

          <div className="space-y-10 text-slate-600">

            {/* 1 */}
            <section id="introduction">
              <h3 className="text-xl font-bold mb-3">1. Acceptance of Terms</h3>
              <p>
                By accessing this platform, you agree to be bound by these Terms and Conditions.
                If you do not agree, you must stop using the platform. We may update these terms at any time.
              </p>
            </section>

            {/* 2 */}
            <section id="eligibility">
              <h3 className="text-xl font-bold mb-3">2. Eligibility</h3>
              <p>
                You confirm that you have the legal authority to enter into this agreement and fulfill your obligations.
              </p>
            </section>

            {/* 3 */}
            <section id="definitions">
              <h3 className="text-xl font-bold mb-3">3. Definitions</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Platform:</strong> Website or app where services are offered</li>
                <li><strong>Transaction:</strong> Purchase request by the user</li>
                <li><strong>Transaction Amount:</strong> Amount paid by user</li>
                <li><strong>Payment Instrument:</strong> UPI, cards, bank, etc.</li>
              </ul>
            </section>

            {/* 4 */}
            <section id="merchant-rights">
              <h3 className="text-xl font-bold mb-3">4. Merchant Rights</h3>
              <p>
                We may collect, store, and use your data to provide services and communicate with you.
              </p>
            </section>

            {/* 5 */}
            <section id="user-responsibilities">
              <h3 className="text-xl font-bold mb-3">5. Your Responsibilities</h3>
              <p>
                You must provide accurate personal and payment information for all transactions.
              </p>
            </section>

            {/* 6 */}
            <section id="prohibited-actions">
              <h3 className="text-xl font-bold mb-3">6. Prohibited Actions</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>No hacking, scraping, or misuse of platform</li>
                <li>No impersonation or fraud</li>
                <li>No harmful or illegal activities</li>
                <li>No reverse engineering or system abuse</li>
              </ul>
            </section>

            {/* 7 */}
            <section id="liability">
              <h3 className="text-xl font-bold mb-3">7. Limitation of Liability</h3>
              <p>
                We are not responsible for losses, damages, or defective services beyond refund policies.
              </p>
            </section>

            {/* 8 */}
            <section id="reviews">
              <h3 className="text-xl font-bold mb-3">8. Reviews Guidelines</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>No offensive or false content</li>
                <li>No fake or misleading reviews</li>
                <li>We may remove reviews at our discretion</li>
              </ul>
            </section>

            {/* 9 */}
            <section id="governing-law">
              <h3 className="text-xl font-bold mb-3">9. Governing Law</h3>
              <p>
                These terms are governed by Indian law. Disputes will be resolved via arbitration in India.
              </p>
            </section>

            {/* 10 */}
            <section id="grievance">
              <h3 className="text-xl font-bold mb-3">10. Grievance Redressal</h3>
              <p>
                For complaints such as refunds, fraud, or transaction issues, please contact support.
              </p>
            </section>

            {/* 11 */}
            <section id="disclaimer">
              <h3 className="text-xl font-bold mb-3">11. Disclaimer</h3>
              <p>
                All transactions are at your own risk. We do not guarantee uninterrupted or error-free service.
                You must keep your account credentials secure.
              </p>
            </section>

          </div>
        </article>
      </main>
    </div>
  );
}