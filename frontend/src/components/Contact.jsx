'use client';

import React from 'react';
import { FaInstagram, FaEnvelope, FaMapMarkerAlt, FaRegClock } from 'react-icons/fa';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
     

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* --- Hero Section --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
            How can we help?
          </h1>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Have questions about your subscription, profile verification, or safety? Our team is here to support you.
          </p>
        </div>

        {/* --- Contact Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Email Card */}
          <a 
            href="mailto:accounts@amoraonline.in" 
            className="group p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FaEnvelope size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Support</h3>
            <p className="text-slate-500 text-sm mb-4">The best way to get help with account or payment issues.</p>
            <span className="text-pink-600 font-semibold text-sm group-hover:underline">
              accounts@amoraonline.in
            </span>
          </a>

          {/* Instagram Card */}
          <a 
            href="https://www.instagram.com/amoraonline_official" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300"
          >
            <div className="h-12 w-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FaInstagram size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2">Instagram</h3>
            <p className="text-slate-500 text-sm mb-4">Follow us for updates, safety tips, and community stories.</p>
            <span className="text-pink-600 font-semibold text-sm group-hover:underline">
              @amoraonline_official
            </span>
          </a>

        </div>

        {/* --- Footer Info Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-slate-100">
          <div className="flex gap-4">
            <div className="text-slate-400 mt-1"><FaMapMarkerAlt /></div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Headquarters</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                City Shahjahanpur, Uttar Pradesh<br />
                PIN: 242001, India
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-slate-400 mt-1"><FaRegClock /></div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Response Time</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                We typically respond to all inquiries within<br />
                <span className="text-slate-900 font-medium">24 - 72 business hours.</span>
              </p>
            </div>
          </div>
        </div>
      </main>

     
    </div>
  );
}