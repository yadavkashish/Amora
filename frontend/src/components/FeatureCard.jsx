import React from "react";
import TiltCard from "./TiltCard";

export default function FeatureCard({ imgSrc, title, description, Icon = null }) {
  return (
    <TiltCard className="group h-[450px] rounded-3xl overflow-hidden bg-[#0a0508] border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
      <img
        src={imgSrc}
        alt={title}
        width={1000}
        height={700}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        style={{ backgroundColor: "#0a0508" }}
      />
      <div className="relative z-20 p-8 h-full flex flex-col justify-end">
        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 backdrop-blur-md flex items-center justify-center mb-6 border border-pink-500/20">
          {Icon ? <Icon className="text-pink-400" /> : null}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>
      </div>
    </TiltCard>
  );
}
