import React from "react";

export default function UserProfileOptionsModal({ open, onClose, onDelete, onLogout }) {
  if (!open) return null;

  const options = [
    "Apps and websites",
    "QR code",
    "Notifications",
    "Settings and privacy",
    "Meta Verified",
    "Supervision",
    "Login activity",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="w-80 bg-[#1a1a22] rounded-2xl overflow-hidden border border-white/10">

        {options.map((label, i) => (
          <React.Fragment key={i}>
            <OptionItem label={label} />
            <Divider />
          </React.Fragment>
        ))}

        <OptionItem label="Delete Account" danger onClick={onDelete} />
        <Divider />

        <OptionItem label="Log Out" onClick={onLogout} />
        <Divider />

        <OptionItem label="Cancel" onClick={onClose} />

      </div>
    </div>
  );
}

function OptionItem({ label, onClick, danger }) {
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
