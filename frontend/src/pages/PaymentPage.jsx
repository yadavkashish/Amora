import React, { useState, useEffect } from "react";
import { Check, Zap, Crown, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [isWaiting, setIsWaiting] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        let interval;
        if (isWaiting) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
                    if (res.data.user.isPremium) {
                        clearInterval(interval);
                        navigate("/dashboard");
                    }
                } catch (err) { console.log("Polling for activation..."); }
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isWaiting, navigate, API_URL]);

   // PaymentPage.jsx
const handleProceed = async () => {
  const res = await axios.post(`${API_URL}/api/payment/create-order`, { planType: selectedPlan });
  
  const message = `
I want to pay ₹${res.data.amount}
Plan: ${selectedPlan}
Order ID: ${res.data.orderId}
[Code: ${res.data.shortId}]
  `.trim();

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
};


    if (isWaiting) {
        return (
            <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-16 h-16 text-pink-500 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
                <p className="text-zinc-400 max-w-sm mb-6">
                    Pay <span className="text-white font-bold">₹{paymentAmount}</span> via WhatsApp. 
                    This page will unlock automatically once confirmed.
                </p>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    <strong>Warning:</strong> Payments via GPay or PhonePe are not guaranteed and cannot be claimed. Use WhatsApp Pay only.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 mb-20">
                {/* Monthly Plan */}
                <div onClick={() => setSelectedPlan("monthly")} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "monthly" ? "border-pink-500 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
                    <Zap className="text-pink-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Monthly</h3>
                    <p className="text-4xl font-black text-white my-4">₹49</p>
                </div>

                {/* Yearly Plan */}
                <div onClick={() => setSelectedPlan("yearly")} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "yearly" ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5"}`}>
                    <Crown className="text-purple-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Yearly</h3>
                    <p className="text-4xl font-black text-white my-4">₹299</p>
                </div>
            </div>
            
            <button onClick={handleProceed} className="fixed bottom-10 px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform">
                Unlock via WhatsApp Pay
            </button>
        </div>
    );
}