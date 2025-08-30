'use client';

import { FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Contact() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-pink-600 mb-6">Contact Me</h1>
        <p className="text-gray-700 mb-4">Feel free to reach out via email or Instagram!</p>

        <div className="flex flex-col gap-4 text-gray-800 text-lg">
          <div className="flex items-center justify-center gap-3">
            <FaEnvelope className="text-pink-600" />
            <a href="getamora.team@gmail.com" className="hover:underline">
              getamora.team@gmail.com
            </a>
          </div>

          <div className="flex items-center justify-center gap-3">
            <FaInstagram className="text-pink-600" />
            <a
              href="https://www.instagram.com/amora.teams/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @amora.teams
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
