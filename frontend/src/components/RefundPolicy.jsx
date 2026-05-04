'use client';

import React, { useState, useEffect } from 'react';

export default function RefundPolicy() {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: '1. Overview' },
    { id: 'cancellation', title: '2. Cancellation Policy' },
    { id: 'refund', title: '3. Refund Eligibility' },
    { id: 'process', title: '4. How to Request Refund' },
    { id: 'approval', title: '5. Approval & Processing' },
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
          <div className="mb-12">
            <h1 className="text-4xl font-black mb-4">
              Refund & Cancellation Policy
            </h1>
            <p className="text-slate-500 text-sm">
              Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-10 text-slate-600">

            {/* 1 */}
            <section id="introduction">
              <h3 className="text-xl font-bold mb-3">1. Overview</h3>
              <p>
                Upon completing a transaction, you enter into a legally binding agreement with us 
                to purchase the product and/or service.
              </p>
            </section>

            {/* 2 */}
            <section id="cancellation">
              <h3 className="text-xl font-bold mb-3">2. Cancellation Policy</h3>
              <p>
                After completing a transaction, cancellation may only be allowed if it is specifically 
                provided on the Platform. All cancellation requests are subject to our discretion, and 
                we may require additional information before approval.
              </p>
            </section>

            {/* 3 */}
            <section id="refund">
              <h3 className="text-xl font-bold mb-3">3. Refund Eligibility</h3>
              <p>
                Refunds or replacements are only applicable if the product or service does not match 
                the description provided on the Platform.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Requests must be made within <strong>3 days</strong> of the transaction</li>
                <li>Requests submitted after this period may not be considered</li>
              </ul>
            </section>

            {/* 4 */}
            <section id="process">
              <h3 className="text-xl font-bold mb-3">4. How to Request a Refund</h3>
              <p>You can request a refund by:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Raising a support ticket on the platform</li>
                <li>
                  Contacting us at: 
                  <span className="text-pink-600 ml-1">
                    seller+ee2bae0af9024fc5b9bd8b9c01e56887@instamojo.com
                  </span>
                </li>
              </ul>
              <p className="mt-3">
                Please include transaction details, reason for refund, and any supporting proof.
              </p>
            </section>

            {/* 5 */}
            <section id="approval">
              <h3 className="text-xl font-bold mb-3">5. Approval & Processing</h3>
              <p>
                Refund approval is at our sole discretion. We may request additional details before 
                processing any request. Approved refunds will be processed through the original 
                payment method.
              </p>
            </section>

          </div>
        </article>
      </main>
    </div>
  );
}