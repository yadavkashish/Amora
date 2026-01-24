import React from "react";
import { relativeTime } from "../utils/time";

export default function Chats({
  users,
  currentUserId,
  selectedUserId,
  onSelectUser,
}) {
  const getProfilePic = (pic) => {
    if (!pic) return "https://via.placeholder.com/80";
    if (pic.startsWith("http")) return pic;
    return `${import.meta.env.VITE_API_URL}/${pic}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-16">
        {users?.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No chats yet.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {users.map((user) => {
              const isSelected = selectedUserId === user._id;

              // 🔥 unread logic FIXED
              const isLastMsgFromOther =
                user.lastMessageSender &&
                user.lastMessageSender.toString() !== currentUserId.toString();

              const hasUnread = isLastMsgFromOther && user.unreadCount > 0;

              return (
                <li
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className={`
                    flex items-center gap-4 px-5 py-4 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "bg-white/10 border-l-4 border-pink-500 pl-4"
                        : "hover:bg-white/5 border-l-4 border-transparent pl-4"
                    }
                  `}
                >
                  {/* Profile */}
                  <img
                    src={
                      user.isBlocked && user.blockedBy !== currentUserId
                        ? "/blocked-avatar.png" // THEY BLOCKED ME
                        : getProfilePic(user.profilePic) // normal
                    }
                    className="w-12 h-12 rounded-full"
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {user.name}
                      </p>
                      <span
                        className={`text-[10px] ${
                          hasUnread
                            ? "text-pink-400 font-bold"
                            : "text-zinc-500"
                        }`}
                      >
                        {user.timestamp ? relativeTime(user.timestamp) : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* preview */}
                      <p
                        className={`text-xs truncate max-w-[80%] ${
                          hasUnread ? "font-bold text-white" : "text-zinc-500"
                        }`}
                      >
                        {user.lastMessage || "Start a conversation"}
                      </p>

                      {/* arrow */}
                      {hasUnread && (
                        <span className="text-pink-400 text-lg ml-2">➤</span>
                      )}

                      {/* badge */}
                      {hasUnread && (
                        <span className="w-5 h-5 rounded-full bg-pink-500 text-[10px] flex items-center justify-center text-white font-bold ml-2">
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
