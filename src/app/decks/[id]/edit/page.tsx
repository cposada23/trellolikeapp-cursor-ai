import { auth } from '@clerk/nextjs/server';
import { getDeckWithCards } from '@/db/queries/deck-queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DeckEditForm from './components/deck-edit-form';
import CardManagement from './components/card-management';

interface EditDeckPageProps {
  params: { id: string };
}

export default async function EditDeckPage({ params }: EditDeckPageProps) {
  const { userId } = await auth();
  
  // Double check authentication - redirect if not signed in
  if (!userId) {
    redirect('/');
  }

  // Convert id to number and fetch deck with cards
  const deckId = parseInt(params.id, 10);
  
  if (isNaN(deckId)) {
    redirect('/dashboard');
  }

  try {
    const deck = await getDeckWithCards(deckId);
    
    if (!deck) {
      redirect('/dashboard');
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="text-purple-300 hover:text-white border-purple-500 hover:border-purple-400 hover:bg-purple-600/20 bg-transparent">
                ← Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Edit Deck</h1>
              <p className="text-purple-300">Modify your flashcard deck and manage cards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deck Edit Form */}
            <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Deck Information</CardTitle>
              </CardHeader>
              <CardContent>
                <DeckEditForm deck={deck} />
              </CardContent>
            </Card>

            {/* Deck Stats */}
            <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white text-xl">Deck Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Cards</span>
                    <span className="text-2xl font-bold text-white">{deck.cards.length}</span>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Created</span>
                    <span className="text-gray-400">{new Date(deck.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Last Updated</span>
                    <span className="text-gray-400">{new Date(deck.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card Management Section */}
          <div className="mt-8">
            <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Manage Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardManagement deck={deck} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading deck:', error);
    redirect('/dashboard');
  }
}
