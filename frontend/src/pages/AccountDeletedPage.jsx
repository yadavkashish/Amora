export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-red-500">Account Deleted</h1>
        <p className="text-zinc-300">This account has been permanently deleted.</p>
        <a
          href="/signup"
          className="text-pink-500 underline text-lg"
        >
          Create a new account
        </a>
      </div>
    </div>
  );
}
