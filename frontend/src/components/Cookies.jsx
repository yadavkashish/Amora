'use client';

import React, { useState, useEffect } from 'react';
import { FaCookieBite, FaShieldAlt, FaChartBar, FaWhatsapp } from 'react-icons/fa';

export default function Cookies() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'about', title: '1. What are Cookies?' },
    { id: 'how-we-use', title: '2. How We Use Cookies' },
    { id: 'types', title: '3. Types of Cookies' },
    { id: 'whatsapp', title: '4. Third-Party (WhatsApp)' },
    { id: 'managing', title: '5. Managing Preferences' },
    { id: 'updates', title: '6. Policy Updates' },
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
        
        {/* --- Sidebar Navigation --- */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
          <nav className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-4 font-mono">Policy Index</p>
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

        {/* --- Content Area --- */}
        <article className="lg:col-span-9 max-w-2xl">
          <div className="mb-12">
            <div className="flex items-center gap-3 text-pink-600 mb-4">
              <FaCookieBite size={24} />
              <span className="text-xs font-bold uppercase tracking-widest">Cookie Policy</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
              We value your transparency.
            </h1>
            <p className="text-slate-500 text-sm">
              Last Updated: January 9, 2026
            </p>
          </div>

          <div className="prose prose-slate prose-pink max-w-none space-y-12">
            
            <section id="about" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-mono">1. What are Cookies?</h3>
              <p className="leading-relaxed text-slate-600">
                Cookies are small text files stored on your device when you visit a website or use an app. 
                They help us recognize your device and remember information about your visit, like your 
                login status and preferences.
              </p>
            </section>

            <section id="how-we-use" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-mono">2. How We Use Cookies</h3>
              <p className="text-slate-600 mb-6">
                AmoraOnline uses cookies to provide a seamless dating experience. This includes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm">
                  <FaShieldAlt className="text-pink-600 mb-3" />
                  <h4 className="font-bold text-sm mb-1">Security</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Keeping your account secure and preventing fraudulent logins.</p>
                </div>
                <div className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm">
                  <FaChartBar className="text-pink-600 mb-3" />
                  <h4 className="font-bold text-sm mb-1">Performance</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Understanding which features are most popular to improve the app.</p>
                </div>
              </div>
            </section>

            <section id="types" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-mono">3. Types of Cookies</h3>
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Category</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-pink-600">Essential</td>
                      <td className="px-4 py-3 text-slate-500 italic">Authentication and security. Cannot be turned off.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Functional</td>
                      <td className="px-4 py-3 text-slate-500">Remembers your search filters and preferences.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Analytics</td>
                      <td className="px-4 py-3 text-slate-500">Anonymous data on app usage trends.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="whatsapp" className="scroll-mt-32 p-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <FaWhatsapp className="text-green-600 text-xl" />
                <h3 className="text-lg font-bold text-green-900">4. Third-Party (WhatsApp)</h3>
              </div>
              <p className="text-green-800/80 text-sm leading-relaxed">
                Because we process payments via <strong>WhatsApp Pay</strong>, Meta (WhatsApp) may place their own 
                cookies on your device to facilitate secure transactions. These cookies are governed by 
                WhatsApp's own Cookie Policy.
              </p>
            </section>

            <section id="managing" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-mono">5. Managing Preferences</h3>
              <p className="leading-relaxed text-slate-600">
                Most web browsers and mobile devices allow you to control cookies through their settings. 
                Please note that disabling certain cookies may result in the inability to access 
                premium features or log into your AmoraOnline account.
              </p>
            </section>

            <section id="updates" className="scroll-mt-32 pb-20">
              <h3 className="text-xl font-bold text-slate-800 mb-4 font-mono">6. Policy Updates</h3>
              <p className="leading-relaxed text-slate-600">
                We may update this policy to reflect changes in our service or regulatory requirements. 
                We encourage you to review this page periodically.
              </p>
              <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Questions?</p>
                <p className="text-sm">Contact our privacy team at <span className="text-pink-400 font-bold">accounts@amoraonline.in</span></p>
              </div>
            </section>

          </div>
        </article>
      </main>

      
    </div>
  );
}