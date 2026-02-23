import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SettingsSidebar() {
  const nav = useNavigate();
  const location = useLocation();

 const items = [
  { label: "Edit Profile", to: "/profile", state: { openEdit: true } },
  { label: "Blocked Users", to: "/settings" },
  { label: "Account Privacy", to: "/settings/privacy" },
];


  return (
    <aside
      className="
        hidden md:flex flex-col w-72 
        h-[calc(100vh-6rem)] sticky top-24
        border-r border-white/5 
        px-6 py-4 
      "
    >
      {items.map((item, idx) =>
        item.type === "section" ? (
          <h2
            key={idx}
            className="text-sm font-semibold text-zinc-500 mt-6 mb-3"
          >
            {item.label}
          </h2>
        ) : (
          <button
            key={idx}
            onClick={() => item.to && nav(item.to, { state: item.state })}
            className={`
              flex items-center justify-between w-full
              px-3 py-3 rounded-lg text-left mb-1
              ${
                location.pathname === item.to
                  ? "bg-white/10 text-white font-medium"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
          >
            <span>{item.label}</span>
            <ChevronRight size={18} />
          </button>
        )
      )}
    </aside>
  );
}
