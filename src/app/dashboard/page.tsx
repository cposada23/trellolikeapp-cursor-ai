import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Double check authentication - redirect if not signed in
  if (!userId || !user) {
    redirect('/');
  }

  // Fetch user's decks with card counts
  const userDecksWithCounts = await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      cardCount: count(cardsTable.id),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id, decksTable.name, decksTable.description, decksTable.createdAt)
    .orderBy(decksTable.createdAt);

  // Calculate total statistics
  const totalDecks = userDecksWithCounts.length;
  const totalCards = userDecksWithCounts.reduce((sum, deck) => sum + deck.cardCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}!
          </h1>
          <p className="text-purple-300">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-900/40 backdrop-blur border border-purple-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Total Decks</h3>
            <p className="text-3xl font-bold text-white">{totalDecks}</p>
          </div>
          <div className="bg-blue-900/40 backdrop-blur border border-blue-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Total Cards</h3>
            <p className="text-3xl font-bold text-white">{totalCards}</p>
          </div>
          <div className="bg-indigo-900/40 backdrop-blur border border-indigo-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">Average Cards/Deck</h3>
            <p className="text-3xl font-bold text-white">
              {totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Create New Deck
            </Button>
            <Button variant="outline" className="text-purple-300 hover:text-white border-purple-500 hover:border-purple-400 hover:bg-purple-600/20 bg-transparent">
              Browse All Decks
            </Button>
            <Button variant="outline" className="text-blue-300 hover:text-white border-blue-500 hover:border-blue-400 hover:bg-blue-600/20 bg-transparent">
              Study Random Cards
            </Button>
          </div>
        </div>

        {/* Recent Decks */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Decks</h2>
          {userDecksWithCounts.length === 0 ? (
            <div className="bg-gray-900/40 backdrop-blur border border-gray-800/50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No decks yet</h3>
              <p className="text-gray-400 mb-4">
                Create your first flashcard deck to get started!
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Create Your First Deck
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDecksWithCounts.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-gray-900/40 backdrop-blur border border-gray-800/50 rounded-lg p-6 hover:border-purple-500/50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {deck.name}
                    </h3>
                    <span className="text-sm text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                      {deck.cardCount} cards
                    </span>
                  </div>
                  {deck.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created {new Date(deck.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Study
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
