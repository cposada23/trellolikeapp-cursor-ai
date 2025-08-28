import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyDeckPromptProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
  };
}

export function EmptyDeckPrompt({ deck }: EmptyDeckPromptProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="text-purple-300 hover:text-purple-200 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Study: {deck.name}
          </h1>
          {deck.description && (
            <p className="text-purple-300">{deck.description}</p>
          )}
        </div>

        {/* Empty State Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900/40 backdrop-blur border-gray-800/50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">
                This deck has no cards to study
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-400">
                You need to add some flashcards before you can start studying. 
                Create your first cards to begin your learning journey!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/decks/${deck.id}/edit`}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Cards to Deck
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="text-purple-300 hover:text-white border-purple-500 hover:border-purple-400 hover:bg-purple-600/20 bg-transparent">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              
              <div className="text-sm text-gray-500 pt-4">
                <p>💡 Tip: Add at least a few cards to make studying more effective!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
