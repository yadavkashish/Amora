'use client';

import React, { useState, useEffect } from 'react';

export default function Terms() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'who-we-are', title: '2. Who We Are' },
    { id: 'eligibility', title: '3. Eligibility' },
    { id: 'account-authenticity', title: '4. Account Authenticity' },
    { id: 'user-conduct', title: '5. User Conduct' },
    { id: 'compatibility', title: '6. Matching Disclaimer' },
    { id: 'payments', title: '7. Subscriptions' },
    { id: 'liability', title: '8. Limitation of Liability' },
    { id: 'governing-law', title: '9. Governing Law' },
  ];

  // Optional: Handle scroll highlighting for the sidebar
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-pink-100">
      {/* --- Header Section --- */}
      

      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- Sidebar Navigation (Desktop) --- */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
          <nav className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Contents</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block py-2 text-sm transition-all border-l-2 pl-4 ${
                  activeSection === section.id 
                  ? 'border-pink-600 text-pink-600 font-semibold' 
                  : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* --- Main Content --- */}
        <article className="lg:col-span-9 max-w-2xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-500 text-sm">
              Effective Date: January 9, 2026 | Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-slate prose-pink max-w-none space-y-10">
            
            <section id="introduction" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h3>
              <p className="leading-relaxed text-slate-600">
                By creating an account or using the AmoraOnline mobile application or website (the "Service"), 
                you agree to be bound by these Terms of Service. These terms constitute a legally binding 
                agreement between you and AmoraOnline.
              </p>
            </section>

            <section id="who-we-are" className="scroll-mt-32 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2">2. Who We Are</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>AmoraOnline</strong> is operated in India. For inquiries regarding data protection 
                or legal service, please contact:
              </p>
              <address className="not-italic mt-3 text-sm text-slate-500 leading-6">
                AmoraOnline Business Services<br />
                City Shahjahanpur, Uttar Pradesh<br />
                PIN: 242001, India<br />
                Email: <span className="text-pink-600">accounts@amoraonline.in</span>
              </address>
            </section>

            <section id="eligibility" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">3. Eligibility</h3>
              <p className="leading-relaxed text-slate-600">
                You must be at least <strong>18 years of age</strong> to create an account on AmoraOnline. 
                By using our service, you represent and warrant that you have the right, authority, and capacity 
                to enter into this agreement.
              </p>
            </section>

            <section id="account-authenticity" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">4. Account Authenticity</h3>
              <p className="leading-relaxed text-slate-600">
                AmoraOnline is built on trust. You agree to:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                <li>Provide accurate, current, and complete information.</li>
                <li>Upload only photographs of yourself.</li>
                <li>Not create multiple accounts or use automated tools to scrape data.</li>
              </ul>
            </section>

            <section id="user-conduct" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">5. User Conduct</h3>
              <p className="leading-relaxed text-slate-600">
                Harassment, bullying, or hate speech is strictly prohibited. We maintain a zero-tolerance policy 
                for scams, commercial solicitation, or the distribution of explicit content without consent.
              </p>
            </section>

            <section id="compatibility" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">6. Matching & Compatibility Disclaimer</h3>
              <p className="leading-relaxed text-slate-600">
                While our algorithms aim to connect you with compatible partners, we do not guarantee match 
                frequency, quality, or successful relationship outcomes. Interactions are at your own discretion.
              </p>
            </section>

            <section id="payments" className="scroll-mt-32 border-l-4 border-pink-500 pl-6 py-2">
              <h3 className="text-xl font-bold text-slate-800 mb-4 text-pink-700">7. Subscriptions & Payments</h3>
              <p className="leading-relaxed text-slate-600 font-medium">
                Certain premium features require payment. Once a transaction is processed, it is 
                <span className="text-pink-600 underline decoration-pink-200 underline-offset-4 ml-1">non-refundable</span>. 
                AmoraOnline does not offer pro-rated refunds for cancelled subscriptions.
              </p>
            </section>

            <section id="liability" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">8. Limitation of Liability</h3>
              <p className="leading-relaxed text-slate-600">
                To the maximum extent permitted by law, AmoraOnline shall not be liable for any indirect, 
                incidental, or punitive damages, or any loss of data, use, or goodwill resulting from your access 
                to or use of the service.
              </p>
            </section>

            <section id="governing-law" className="scroll-mt-32 pb-20">
              <h3 className="text-xl font-bold text-slate-800 mb-4">9. Governing Law</h3>
              <p className="leading-relaxed text-slate-600">
                These terms are governed by the laws of <strong>India</strong>. Any disputes shall be subject 
                to the exclusive jurisdiction of the courts located in Uttar Pradesh, India.
              </p>
            </section>

          </div>
        </article>
      </main>

     
    </div>
  );
}