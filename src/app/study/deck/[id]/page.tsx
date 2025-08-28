import { auth } from '@clerk/nextjs/server';
import { getDeckWithCards } from '@/db/queries/deck-queries';
import { redirect } from 'next/navigation';
import { StudySession } from '@/app/study/deck/[id]/components/study-session';
import { EmptyDeckPrompt } from '@/app/study/deck/[id]/components/empty-deck-prompt';

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();
  
  // Check authentication - redirect if not signed in
  if (!userId) {
    redirect('/');
  }

  const { id } = await params;
  const deckId = parseInt(id, 10);
  
  // Validate deck ID
  if (isNaN(deckId)) {
    redirect('/dashboard');
  }

  try {
    // Fetch deck with cards using existing query helper function
    const deck = await getDeckWithCards(deckId);
    
    // If deck doesn't exist or user doesn't own it, redirect to dashboard
    if (!deck) {
      redirect('/dashboard');
    }

    // If deck has no cards, show prompt to add cards
    if (!deck.cards || deck.cards.length === 0) {
      return <EmptyDeckPrompt deck={deck} />;
    }

    // Render study session with deck and cards
    return <StudySession deck={deck} cards={deck.cards} />;
    
  } catch (error) {
    console.error('Error fetching deck for study:', error);
    redirect('/dashboard');
  }
}
