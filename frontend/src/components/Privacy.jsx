'use client';

export default function Privacy() {
  return (
    <section className="min-h-screen pt-22 p-8 bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 text-center">Privacy Policy</h1>
        <p className="text-gray-600">Effective Date: [Insert Date]</p>

        <div className="space-y-4 text-gray-700">
          <p><strong>1. Data Collection:</strong> We collect personal information you provide such as name, email, and profile details.</p>
          <p><strong>2. Use of Information:</strong> Data is used to provide and improve our services, personalize your experience, and communicate updates.</p>
          <p><strong>3. Data Sharing:</strong> We do not sell your personal information. Data may be shared with trusted third-party services for operational purposes.</p>
          <p><strong>4. Security:</strong> We implement measures to protect your data, but no system is completely secure. Use the platform responsibly.</p>
          <p><strong>5. User Rights:</strong> You may access, update, or delete your personal data. Contact us to exercise these rights.</p>
          <p><strong>6. Cookies and Tracking:</strong> We use cookies to improve user experience. You can control cookie settings via your browser.</p>
          <p><strong>7. Changes:</strong> Updates to the privacy policy will be posted here. Continued use indicates acceptance.</p>
        </div>
      </div>
    </section>
  );
}
