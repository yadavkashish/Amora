import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import ProfileForm from './pages/ProfileForm';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage'; 
import ViewProfile from './components/ViewProfile'
import CompatibilityForm from './pages/CompatibilityForm'
import Privacy from './components/Privacy'
import Contact from './components/Contact'
import Terms from './components/Terms'
import Footer from './components/Footer'

export default function App() {
  return (
    <Router>
      <div className="flex flex-col font-sans">
        {/* Global Header */}
        <Header />

        {/* Main Pages */}
        <main className="bg-gradient-to-b from-pink-50 to-pink-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/compatibilityform" element={<CompatibilityForm />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/profileform" element={<ProfileForm/>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:userId" element={<ChatPage />} />
            <Route path="/view-profile/:userId" element={<ViewProfile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
