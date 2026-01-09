import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Eager (critical for first paint)
import HomePage from './pages/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import PaymentPage from './pages/PaymentPage';
// Lazy (split into separate chunks)
const Login = lazy(() => import(/* webpackChunkName: "login" */ './pages/Login'));
const Signup = lazy(() => import(/* webpackChunkName: "signup" */ './pages/Signup'));
const ProfileForm = lazy(() => import(/* webpackChunkName: "profile-form" */ './pages/ProfileForm'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ './pages/Profile'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'));
const ChatPage = lazy(() => import(/* webpackChunkName: "chat" */ './pages/ChatPage'));
const ViewProfile = lazy(() => import(/* webpackChunkName: "view-profile" */ './components/ViewProfile'));
const CompatibilityForm = lazy(() => import(/* webpackChunkName: "compatibility-form" */ './pages/CompatibilityForm'));
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ './components/Contact'));
const Terms = lazy(() => import(/* webpackChunkName: "terms" */ './components/Terms'));
const Cookies = lazy(() => import(/* webpackChunkName: "cookies" */ './components/Cookies'));
const Privacy = lazy(() => import(/* webpackChunkName: "privacy" */ './components/Privacy'));
const PersonalityReportDisplay = lazy(() => import(/* webpackChunkName: "personality-report-display" */ './pages/PersonalityReport'));
const PersonalityReportPage = lazy(() => import(/* webpackChunkName: "personality-report-page" */ './pages/PersonalityReportPage'));

export default function App() {
  return (
    <Router>
      <div className="flex flex-col font-sans">
        {/* Global Header */}
        <Header />

        {/* Main Pages */}
        <main className="bg-gradient-to-b from-pink-50 to-pink-100">
          <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/compatibilityform" element={<CompatibilityForm />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profileform" element={<ProfileForm />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:userId" element={<ChatPage />} />
              <Route path="/view-profile/:userId" element={<ViewProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/personality-report" element={<PersonalityReportDisplay />} />
              <Route path="/personality-report/:userId" element={<PersonalityReportPage />} />
              <Route path="/premium" element={< PaymentPage/>} />
            </Routes>
          </Suspense>
        </main>
        {/* Footer */}
        <Footer />
        
      </div>
    </Router>
  );
}
