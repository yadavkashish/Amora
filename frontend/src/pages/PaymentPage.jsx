import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [isWaiting, setIsWaiting] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(null);
    const navigate = useNavigate();
    
    const API_URL = import.meta.env.VITE_API_URL;

    // --- POLLING LOGIC ---
    useEffect(() => {
        let interval;
        if (isWaiting) {
            // Check every 4 seconds if the user is now Premium
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
                    if (res.data.user.isPremium) {
                        clearInterval(interval);
                        alert("🎉 Premium Activated Successfully!");
                        navigate("/dashboard");
                    }
                } catch (err) {
                    console.log("Polling for payment status...");
                }
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isWaiting, navigate, API_URL]);

    const handleProceed = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/payment/create-order`, { planType: selectedPlan }, { withCredentials: true });
            
            const amount = res.data.amount;
            setPaymentAmount(amount);
            setIsWaiting(true);

            const phone = "919559167131";
            const message = `Hi! I paid ₹${amount} for ${selectedPlan} subscription. (Order: ${res.data.orderId})`;
            
            // Open WhatsApp in new tab
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        } catch (err) {
            alert("Payment init failed. Please try again.");
        }
    };

    if (isWaiting) {
        return (
            <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-16 h-16 text-pink-500 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for Payment...</h2>
                <p className="text-zinc-400 max-w-sm">
                    Once you pay <span className="text-white font-bold">₹{paymentAmount}</span> via WhatsApp, 
                    this page will automatically refresh.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center p-6">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
                {/* Monthly Plan */}
                <div onClick={() => setSelectedPlan("monthly")} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "monthly" ? "border-pink-500 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
                    <Zap className="text-pink-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Monthly</h3>
                    <p className="text-4xl font-black text-white my-4">₹49</p>
                    <ul className="text-zinc-400 space-y-2">
                        <li className="flex gap-2"><Check className="w-4 text-green-500"/> See all profiles</li>
                    </ul>
                </div>

                {/* Yearly Plan */}
                <div onClick={() => setSelectedPlan("yearly")} className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === "yearly" ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5"}`}>
                    <Crown className="text-purple-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Yearly</h3>
                    <p className="text-4xl font-black text-white my-4">₹299</p>
                    <ul className="text-zinc-400 space-y-2">
                        <li className="flex gap-2"><Check className="w-4 text-green-500"/> Priority Support</li>
                    </ul>
                </div>
            </div>
            
            <button onClick={handleProceed} className="fixed bottom-10 px-12 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform">
                Unlock Premium Now
            </button>
        </div>
    );
}