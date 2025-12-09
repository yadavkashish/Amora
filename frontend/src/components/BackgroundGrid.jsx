import React from "react";
import { motion } from "framer-motion";

export default function BackgroundGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 bg-[#05030a]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 10% 0%, rgba(244, 63, 94, 0.18), transparent 55%),
          radial-gradient(circle at 90% 100%, rgba(168, 85, 247, 0.18), transparent 55%),
          radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.12), transparent 55%)
        `,
        }}
      />
      <div
        className="absolute inset-y-[-200px] left-1/2 w-[260px] -translate-x-1/2 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent, rgba(251, 113, 133, 0.2), transparent)",
          filter: "blur(20px)",
        }}
      />
      <motion.div
        className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-pink-500/25 blur-[90px]"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 10, -10, 0],
          opacity: [0.55, 0.9, 0.7, 0.55],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-24 w-[380px] h-[380px] rounded-full bg-purple-500/25 blur-[90px]"
        animate={{
          x: [0, -20, 25, 0],
          y: [0, -10, 5, 0],
          opacity: [0.45, 0.8, 0.6, 0.45],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-24 left-[15%] text-pink-400/40 text-[10px]">♥</div>
      </motion.div>
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px 60px #05030a" }} />
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
      />
    </div>
  );
}
