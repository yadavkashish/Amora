import React from "react";
import { relativeTime } from "../utils/time";

export default function Chats({ users, currentUserId, selectedUserId, onSelectUser }) {
  return (
    <aside className="w-72 border-r border-gray-200 bg-white h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users?.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No chats yet. Start a conversation!</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li
                key={u._id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedUserId === u._id ? "bg-gray-50" : "bg-white"}`}
                onClick={() => onSelectUser(u)}
              >
                <img
                  src={u.profilePic ? `http://localhost:5000/uploads/${u.profilePic}` : "https://via.placeholder.com/80"}
                  alt={u.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <span className="ml-2 text-[11px] text-gray-400">{u.timestamp ? relativeTime(u.timestamp) : ""}</span>
                  </div>
                <p
  className={`text-sm truncate ${
    u.unreadCount > 0 ? "font-bold text-gray-900" : "text-gray-500"
  }`}
>
  {u.lastMessage || "Start a conversation"}
</p>


                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
