// app.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import Footer from './components/Footer';
import Form from './pages/Form';
import Bg from './components/Bg';
import ProfileForm from './pages/ProfileForm';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage'; 
import ViewProfile from './components/ViewProfile'// Adjust path if it's somewhere else
import CompatibilityForm from './pages/CompatibilityForm'

export default function App() {
  return (
    <Router>
    
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-pink-100 font-sans">
        {/* Global Header */}
        <Header />

        {/* Main Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/compatibilityform" element={<CompatibilityForm />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/form" element={<Form />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/profileform" element={<ProfileForm/>} />
            <Route path="/chat" element={<ChatPage />} />
           <Route path="/chat/:userId" element={<ChatPage />} />
           <Route path="/view-profile/:userId" element={<ViewProfile />} />

          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

