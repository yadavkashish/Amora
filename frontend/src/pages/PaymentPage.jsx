import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown } from "lucide-react";
import axios from "axios";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [paymentAmount, setPaymentAmount] = useState(null);
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = BASE_URL || "http://localhost:5000";

  const handleProceed = async () => {
    const res = await axios.post(`${API_URL}/api/payment/create-order`, { planType: selectedPlan }, { withCredentials: true });
    setPaymentAmount(res.data.amount);
    // Redirect to WhatsApp or show UPI QR here
    window.location.href = `https://wa.me/919559167131?text=I want to pay ${res.data.amount} for ${selectedPlan} subscription.`;
  };

  return (
    <div className="min-h-screen bg-[#05030a] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div 
          onClick={() => setSelectedPlan("monthly")}
          className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "monthly" ? "border-pink-500 bg-pink-500/10" : "border-white/10 bg-white/5"}`}
        >
          <Zap className="text-pink-500 mb-4" />
          <h3 className="text-2xl font-bold text-white">Monthly</h3>
          <p className="text-4xl font-black text-white my-4">₹49</p>
          <ul className="text-zinc-400 space-y-2">
            <li className="flex gap-2"><Check className="w-4 text-green-500"/> See all profiles</li>
            <li className="flex gap-2"><Check className="w-4 text-green-500"/> Unlimited Chat</li>
          </ul>
        </div>

        {/* Yearly Plan */}
        <div 
          onClick={() => setSelectedPlan("yearly")}
          className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "yearly" ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5"}`}
        >
          <Crown className="text-purple-500 mb-4" />
          <h3 className="text-2xl font-bold text-white">Yearly</h3>
          <p className="text-4xl font-black text-white my-4">₹299</p>
          <p className="text-xs text-purple-400 mb-4 font-bold">SAVE 50%</p>
          <ul className="text-zinc-400 space-y-2">
            <li className="flex gap-2"><Check className="w-4 text-green-500"/> All Monthly features</li>
            <li className="flex gap-2"><Check className="w-4 text-green-500"/> Priority Support</li>
          </ul>
        </div>
      </div>
      
      <button 
        onClick={handleProceed}
        className="fixed bottom-10 px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-xl shadow-xl"
      >
        Unlock Premium Now
      </button>
    </div>
  );
}