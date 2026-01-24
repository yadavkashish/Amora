import React from "react";

export default function ViewProfileOptionsModal({ open, onClose, onBlock }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="w-80 bg-[#1a1a22] rounded-2xl overflow-hidden border border-white/10">

        <OptionItem label="Block User" danger onClick={onBlock} />
        <Divider />
        <OptionItem label="Report" onClick={() => alert("Reporting...")} />
        <Divider />
        <OptionItem label="Hide Profile" />
        <Divider />
        <OptionItem label="Cancel" onClick={onClose} />

      </div>
    </div>
  );
}

function OptionItem({ label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 text-sm ${
        danger ? "text-red-400 font-semibold" : "text-white"
      } hover:bg-white/5`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="border-t border-white/10 w-full" />;
}
