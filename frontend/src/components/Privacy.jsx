'use client';

import React, { useState, useEffect } from 'react';

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'verification', title: '3. Identity Verification' },
    { id: 'usage', title: '4. How We Use Data' },
    { id: 'whatsapp-pay', title: '5. Payment Privacy' },
    { id: 'sharing', title: '6. Data Sharing' },
    { id: 'retention', title: '7. Data Retention' },
    { id: 'rights', title: '8. Your Rights' },
    { id: 'contact', title: '9. Contact Us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
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
      

      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- Sidebar (Desktop) --- */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
          <nav className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-4">Privacy Sections</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`block py-2 text-sm transition-all border-l-2 pl-4 ${
                  activeSection === section.id 
                  ? 'border-pink-600 text-pink-600 font-semibold bg-pink-50/50' 
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
            <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
              Legal Document
            </span>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-500 text-sm">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-slate prose-pink max-w-none space-y-12">
            
            <section id="introduction" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">1. Introduction</h3>
              <p className="leading-relaxed text-slate-600">
                At AmoraOnline, your privacy is our top priority. This Privacy Policy outlines how we collect, 
                process, and protect your personal information. By using our platform, you consent to the 
                data practices described in this document.
              </p>
            </section>

            <section id="collection" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">2. Information We Collect</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-bold text-sm mb-2 text-slate-800">Provided by You</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Name, email, age, gender, profile photos, interests, and chat messages.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-bold text-sm mb-2 text-slate-800">Collected Automatically</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    IP address, device ID, app usage patterns, and cookies for session management.
                  </p>
                </div>
              </div>
            </section>

            <section id="verification" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">3. Identity Verification</h3>
              <p className="leading-relaxed text-slate-600">
                To prevent catfishing and fake accounts, we may use your uploaded photos for 
                identity verification. This data is used solely to ensure community safety 
                and is encrypted within our systems.
              </p>
            </section>

            <section id="usage" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">4. How We Use Your Data</h3>
              <ul className="space-y-3 text-slate-600 list-none pl-0">
                {[
                  "To generate compatible match suggestions.",
                  "To facilitate secure messaging between users.",
                  "To personalize your experience and preferences.",
                  "To detect and prevent fraudulent activity."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* --- Highlighted WhatsApp Pay Section --- */}
            <section id="whatsapp-pay" className="scroll-mt-32 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <h3 className="text-lg font-bold">5. WhatsApp Pay Privacy</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  All subscription payments are handled externally via **WhatsApp Pay**.
                </p>
                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                  <li>We never store your bank details or UPI IDs.</li>
                  <li>We only receive a confirmation ID to activate your plan.</li>
                  <li>Financial security is managed entirely by Meta's secure infrastructure.</li>
                </ul>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-2.203 0-4.007 1.797-4.007 3.993 0 2.19 1.797 3.993 4.007 3.993 2.203 0 4.007-1.803 4.007-3.993 0-2.197-1.804-3.993-4.007-3.993zm0 5.99c-1.097 0-1.996-.9-1.996-1.997s.899-1.996 1.996-1.996c1.104 0 2.003.899 2.003 1.996s-.899 1.997-2.003 1.997zm0-10.162C6.49 2 2 6.49 2 12.016c0 1.765.459 3.42 1.254 4.86L2.03 21.828l5.122-1.341c1.401.758 3.003 1.196 4.713 1.196 5.51 0 10.135-4.49 10.135-10.044C22.031 6.49 17.541 2 12.031 2zm0 18.044c-1.528 0-2.95-.407-4.184-1.114l-.3-.17-3.082.807.82-3-1.85-1.12c-.75-.436-1.346-1.033-1.782-1.782-.714-1.233-1.114-2.656-1.114-4.184 0-4.408 3.586-7.994 8.031-7.994 4.408 0 7.994 3.586 7.994 7.994 0 4.408-3.586 7.994-7.994 7.994z"/></svg>
              </div>
            </section>

            <section id="sharing" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">6. Data Sharing</h3>
              <p className="leading-relaxed text-slate-600">
                We do not sell your personal information. Data is shared with service providers 
                (Cloud hosting, Analytics) only to the extent necessary to keep the app running.
              </p>
            </section>

            <section id="rights" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4">8. Your Rights</h3>
              <p className="leading-relaxed text-slate-600 mb-4">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Access & Export", "Edit Profile", "Account Deletion"].map((right) => (
                  <div key={right} className="text-xs font-bold p-3 border border-slate-200 rounded text-center text-slate-500 uppercase">
                    {right}
                  </div>
                ))}
              </div>
            </section>

            <section id="contact" className="scroll-mt-32 pb-20">
              <h3 className="text-xl font-bold text-slate-800 mb-4">9. Contact Us</h3>
              <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
                <p className="text-slate-700 text-sm leading-relaxed">
                  For any privacy concerns or data requests, please reach out to our 
                  Privacy Officer:
                </p>
                <p className="mt-4 font-bold text-pink-600">accounts@amoraonline.in</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                  Response Time: 24-48 Hours
                </p>
              </div>
            </section>

          </div>
        </article>
      </main>

      
    </div>
  );
}