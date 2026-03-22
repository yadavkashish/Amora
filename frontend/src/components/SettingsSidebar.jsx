import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SettingsSidebar() {
  const nav = useNavigate();
  const location = useLocation();

  // 🔥 DELETE HANDLER
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await fetch("/api/auth/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      nav("/login");
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  // ✅ SIDEBAR ITEMS
  const items = [
    { label: "Edit Profile", to: "/profile", state: { openEdit: true } },
    { label: "Blocked Users", to: "/settings" },
    { label: "Account Privacy", to: "/settings/privacy" },

    // 🚨 NEW DELETE OPTION
    { label: "Delete Account", action: "delete", danger: true },
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
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => {
            if (item.action === "delete") {
              handleDelete();
            } else if (item.to) {
              nav(item.to, { state: item.state });
            }
          }}
          className={`
            flex items-center justify-between w-full
            px-3 py-3 rounded-lg text-left mb-1 transition
            ${
              item.danger
                ? "text-red-400 hover:bg-red-500/10"
                : location.pathname === item.to
                ? "bg-white/10 text-white font-medium"
                : "hover:bg-white/5 text-zinc-300"
            }
          `}
        >
          <span>{item.label}</span>
          <ChevronRight size={18} />
        </button>
      ))}
    </aside>
  );
}