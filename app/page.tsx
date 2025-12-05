export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-emerald-400">
        Grow-Off Arena
      </h1>

      <p className="text-lg md:text-xl text-center max-w-2xl text-neutral-300 mb-10">
        A multi-tenant platform for hosting cannabis grow competitions. Organizers run
        events, growers submit plant updates, judges score plants, and the leaderboard
        updates in real time.
      </p>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold">
          Dashboard (coming soon)
        </button>
        <button className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-semibold">
          View competitions
        </button>
      </div>
    </main>
  );
}
