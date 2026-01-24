export default function RequestsList({ requests, onAccept, onDelete }) {
  return (
    <div className="p-4 space-y-4 mt-4">
      {requests.length === 0 && (
        <p className="text-zinc-500 text-center mt-10">No chat requests yet.</p>
      )}

      {requests.map((req) => (
        <div
          key={req.chatId}
          className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-md"
        >
          <div className="flex items-center gap-3">
            <img
              src={req.profilePic}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="text-white font-semibold">{req.name}</p>

              {req.note && (
                <p className="text-zinc-400 text-xs mt-1 italic">"{req.note}"</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {/* IMPORTANT: use chatId */}
            <button
              onClick={() => onAccept(req.chatId)}
              className="flex-1 bg-blue-600 py-2 rounded-lg text-white hover:bg-blue-700"
            >
              Confirm
            </button>

            <button
              onClick={() => onDelete(req.chatId)}
              className="flex-1 bg-red-600 py-2 rounded-lg text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
