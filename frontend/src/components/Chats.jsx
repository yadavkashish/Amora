import React from "react";
import { relativeTime } from "../utils/time";

/**
 * Chats Component
 * Displays a list of users with their last message and timestamp.
 * Adapted for Dark/Glassmorphism Theme.
 */
export default function Chats({ users, currentUserId, selectedUserId, onSelectUser }) {
  const getProfilePic = (pic) => {
  if (!pic) return "https://via.placeholder.com/80";
  if (pic.startsWith("http")) return pic;
  return `${import.meta.env.VITE_API_URL}/${pic}`;
};

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-16">
        {users?.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full text-zinc-500">
            <p>No chats yet.</p>
            <span className="text-xs text-zinc-600 mt-1">Start a conversation to see it here.</span>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {users.map((user) => {
              const isSelected = selectedUserId === user._id;
              const hasUnread = user.unreadCount > 0;

              return (
                <li
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className={`
                    relative flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? "bg-white/10 border-l-4 border-pink-500 pl-4" 
                      : "hover:bg-white/5 border-l-4 border-transparent pl-4"
                    }
                  `}
                >
                  {/* User profile picture */}
                  <div className="relative flex-shrink-0">
                    <img
  src={getProfilePic(user.profilePic)}
  alt={user.name}
  className={`w-12 h-12 rounded-full object-cover border border-white/10 ${
    isSelected ? "ring-2 ring-pink-500/30" : ""
  }`}
/>

                    {/* Online Status Dot (Optional placeholder) */}
                    {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div> */}
                  </div>

                  {/* User info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                        {user.name}
                      </p>
                      <span className={`text-[10px] ${hasUnread ? "text-pink-400 font-bold" : "text-zinc-500"}`}>
                        {user.timestamp ? relativeTime(user.timestamp) : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs truncate max-w-[85%] ${
                          hasUnread
                            ? "text-white font-medium"
                            : "text-zinc-500 group-hover:text-zinc-400"
                        }`}
                      >
                        {user.lastMessage 
                          ? (user.lastMessage.length > 30 ? user.lastMessage.substring(0, 30) + "..." : user.lastMessage)
                          : "Start a conversation"
                        }
                      </p>
                      
                      {/* Unread Badge */}
                      {hasUnread && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-lg shadow-pink-500/40">
                          {user.unreadCount > 9 ? "9+" : user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}