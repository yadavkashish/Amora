import React from "react";
import { relativeTime } from "../utils/time";

/**
 * Chats Component
 * Displays a list of users with their last message and timestamp.
 * Highlights the selected user and triggers a callback on user selection.
 * 
 * Props:
 * - users: Array of user objects { _id, name, profilePic, lastMessage, unreadCount, timestamp }
 * - currentUserId: ID of the current logged-in user
 * - selectedUserId: ID of the currently selected chat user
 * - onSelectUser: Callback function triggered when a user is clicked
 */
export default function Chats({ users, currentUserId, selectedUserId, onSelectUser }) {
  return (


    <div className="h-full flex flex-col">
      

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {/* No chats message */}
        {users?.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No chats yet. Start a conversation!
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`
                  flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50
                  ${selectedUserId === user._id ? "bg-gray-50" : "bg-white"}
                `}
              >
                {/* User profile picture */}
                <img
                  src={
                    user.profilePic
                      ? `${import.meta.env.VITE_API_URL}/uploads/${user.profilePic}`
                      : "https://via.placeholder.com/80"
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />

                {/* User info */}
                <div className="min-w-0 flex-1">
                  {/* Name and timestamp */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <span className="ml-2 text-[11px] text-gray-400">
                      {user.timestamp ? relativeTime(user.timestamp) : ""}
                    </span>
                  </div>

                  {/* Last message */}
                  <p
                    className={`text-sm truncate ${
                      user.unreadCount > 0
                        ? "font-bold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {user.lastMessage || "Start a conversation"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
