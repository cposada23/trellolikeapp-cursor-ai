'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { createCardAction, updateCardAction, deleteCardAction } from '@/actions/card-actions';
import { CreateCardSchema, UpdateCardSchema, type CreateCardInput, type UpdateCardInput } from '@/lib/schemas';

interface Card {
  id: number;
  front: string;
  back: string;
  deckId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CardManagementProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    cards: Card[];
  };
}

export default function CardManagement({ deck }: CardManagementProps) {
  const [cards, setCards] = useState(deck.cards);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  
  // Add card form states
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Edit card form states  
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle add card
  async function handleAddCard(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmittingAdd(true);
    setAddError(null);

    const input: CreateCardInput = {
      deckId: deck.id,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
    };

    try {
      CreateCardSchema.parse(input);
      
      const result = await createCardAction(input);
      
      if (result.success && result.data) {
        setCards(prev => [result.data, ...prev]);
        setNewCardFront('');
        setNewCardBack('');
        setIsAddDialogOpen(false);
      } else {
        setAddError(result.error || 'Failed to add card');
      }
    } catch (validationError) {
      if (validationError instanceof Error) {
        setAddError(validationError.message);
      } else {
        setAddError('Validation failed');
      }
    } finally {
      setIsSubmittingAdd(false);
    }
  }

  // Handle edit card
  function startEdit(card: Card) {
    setEditingCard(card);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
    setEditError(null);
  }

  async function handleEditCard(event: React.FormEvent) {
    event.preventDefault();
    if (!editingCard) return;
    
    setIsSubmittingEdit(true);
    setEditError(null);

    const input: UpdateCardInput = {
      front: editCardFront.trim(),
      back: editCardBack.trim(),
    };

    try {
      UpdateCardSchema.parse(input);
      
      const result = await updateCardAction(editingCard.id, input);
      
      if (result.success && result.data) {
        setCards(prev => prev.map(card => 
          card.id === editingCard.id ? result.data : card
        ));
        setEditingCard(null);
        setEditCardFront('');
        setEditCardBack('');
      } else {
        setEditError(result.error || 'Failed to update card');
      }
    } catch (validationError) {
      if (validationError instanceof Error) {
        setEditError(validationError.message);
      } else {
        setEditError('Validation failed');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  // Handle delete card
  async function handleDeleteCard(card: Card) {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteCardAction(card.id);
      
      if (result.success) {
        setCards(prev => prev.filter(c => c.id !== card.id));
        setDeletingCard(null);
      } else {
        setDeleteError(result.error || 'Failed to delete card');
      }
    } catch (error) {
      setDeleteError('Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Card Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Cards ({cards.length})</h3>
          <p className="text-gray-400 text-sm">Manage the flashcards in this deck</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
            </DialogHeader>
            
            {addError && (
              <Alert className="border-red-500 bg-red-500/10 text-red-400">
                {addError}
              </Alert>
            )}
            
            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="front" className="text-gray-300">
                  Front Side *
                </Label>
                <textarea
                  id="front"
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Enter the question or prompt"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="back" className="text-gray-300">
                  Back Side *
                </Label>
                <textarea
                  id="back"
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Enter the answer or explanation"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={isSubmittingAdd}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAdd || !newCardFront.trim() || !newCardBack.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmittingAdd ? 'Adding...' : 'Add Card'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="bg-gray-700" />

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No cards yet</h3>
          <p className="text-gray-400 mb-4">Add your first flashcard to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card, index) => (
            <Card key={card.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs text-purple-300 border-purple-500">
                    Card #{index + 1}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(card)}
                      className="text-xs border-blue-600 text-blue-400 hover:bg-blue-600/10"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingCard(card)}
                      className="text-xs border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Front:</h4>
                    <p className="text-white bg-gray-900/50 p-3 rounded border border-gray-700">
                      {card.front}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Back:</h4>
                    <p className="text-white bg-gray-900/50 p-3 rounded border border-gray-700">
                      {card.back}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(card.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Card Dialog */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          
          {editError && (
            <Alert className="border-red-500 bg-red-500/10 text-red-400">
              {editError}
            </Alert>
          )}
          
          <form onSubmit={handleEditCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-front" className="text-gray-300">
                Front Side *
              </Label>
              <textarea
                id="edit-front"
                value={editCardFront}
                onChange={(e) => setEditCardFront(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Enter the question or prompt"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-back" className="text-gray-300">
                Back Side *
              </Label>
              <textarea
                id="edit-back"
                value={editCardBack}
                onChange={(e) => setEditCardBack(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Enter the answer or explanation"
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCard(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEdit || !editCardFront.trim() || !editCardBack.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingEdit ? 'Updating...' : 'Update Card'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Card Dialog */}
      <Dialog open={!!deletingCard} onOpenChange={(open) => !open && setDeletingCard(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
          </DialogHeader>
          
          {deleteError && (
            <Alert className="border-red-500 bg-red-500/10 text-red-400">
              {deleteError}
            </Alert>
          )}
          
          <div className="space-y-4">
            <Alert className="border-red-500 bg-red-500/10 text-red-400">
              Are you sure you want to delete this card? This action cannot be undone.
            </Alert>
            
            {deletingCard && (
              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-300">Front:</span>
                    <p className="text-white">{deletingCard.front}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">Back:</span>
                    <p className="text-white">{deletingCard.back}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingCard(null)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deletingCard && handleDeleteCard(deletingCard)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Card'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
