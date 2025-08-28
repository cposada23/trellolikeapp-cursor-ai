'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDeckAction, deleteDeckAction } from '@/actions/deck-actions';
import { useRouter } from 'next/navigation';
import { UpdateDeckSchema, type UpdateDeckInput } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';

interface DeckEditFormProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function DeckEditForm({ deck }: DeckEditFormProps) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const input: UpdateDeckInput = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      // Client-side validation
      UpdateDeckSchema.parse(input);

      const result = await updateDeckAction(deck.id, input);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update deck');
      }
    } catch (validationError) {
      if (validationError instanceof Error) {
        setError(validationError.message);
      } else {
        setError('Validation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteDeckAction(deck.id);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to delete deck');
      }
    } catch {
      setError('Failed to delete deck');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-500 bg-red-500/10 text-red-400">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-500 bg-green-500/10 text-green-400">
          Deck updated successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">
            Deck Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
            placeholder="Enter deck name"
            required
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300">
            Description
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            placeholder="Enter deck description (optional)"
            rows={3}
            maxLength={1000}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSubmitting ? 'Updating...' : 'Update Deck'}
        </Button>
      </form>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        
        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Delete Deck
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert className="border-red-500 bg-red-500/10 text-red-400">
              Are you sure you want to delete this deck? This action cannot be undone and will delete all cards in the deck.
            </Alert>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Deck'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
