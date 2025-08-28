'use server';

import { createDeck, updateDeck, deleteDeck } from '@/db/queries/deck-queries';
import { CreateDeckSchema, UpdateDeckSchema, type CreateDeckInput, type UpdateDeckInput } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDeckAction(input: CreateDeckInput) {
  // Validate input with Zod
  const validatedData = CreateDeckSchema.parse(input);
  
  try {
    // Call query helper function
    const newDeck = await createDeck(validatedData);
    
    // Handle post-mutation tasks
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    
    return { success: true, data: newDeck };
  } catch (error) {
    console.error('Failed to create deck:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create deck' };
  }
}

export async function createDeckAndRedirect(input: CreateDeckInput) {
  const validatedData = CreateDeckSchema.parse(input);
  
  try {
    const newDeck = await createDeck(validatedData);
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    redirect(`/decks/${newDeck.id}`);
  } catch (error) {
    console.error('Failed to create deck:', error);
    throw new Error('Failed to create deck');
  }
}

export async function updateDeckAction(deckId: number, input: UpdateDeckInput) {
  const validatedData = UpdateDeckSchema.parse(input);
  
  try {
    const updatedDeck = await updateDeck(deckId, validatedData);
    
    if (!updatedDeck) {
      return { success: false, error: 'Deck not found or unauthorized' };
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    revalidatePath(`/decks/${deckId}`);
    revalidatePath(`/decks/${deckId}/edit`);
    
    return { success: true, data: updatedDeck };
  } catch (error) {
    console.error('Failed to update deck:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update deck' };
  }
}

export async function deleteDeckAction(deckId: number) {
  try {
    await deleteDeck(deckId);
    
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete deck:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete deck' };
  }
}
