'use server';

import { createCard, updateCard, deleteCard } from '@/db/queries/card-queries';
import { CreateCardSchema, UpdateCardSchema, type CreateCardInput, type UpdateCardInput } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function createCardAction(input: CreateCardInput) {
  // Validate input with Zod
  const validatedData = CreateCardSchema.parse(input);
  
  try {
    // Call query helper function
    const newCard = await createCard(validatedData);
    
    // Handle post-mutation tasks
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    revalidatePath(`/decks/${validatedData.deckId}`);
    revalidatePath(`/decks/${validatedData.deckId}/edit`);
    
    return { success: true, data: newCard };
  } catch (error) {
    console.error('Failed to create card:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create card' };
  }
}

export async function updateCardAction(cardId: number, input: UpdateCardInput) {
  const validatedData = UpdateCardSchema.parse(input);
  
  try {
    const updatedCard = await updateCard(cardId, validatedData);
    
    if (!updatedCard) {
      return { success: false, error: 'Card not found or unauthorized' };
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    revalidatePath(`/decks/${updatedCard.deckId}`);
    revalidatePath(`/decks/${updatedCard.deckId}/edit`);
    
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error('Failed to update card:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to update card' };
  }
}

export async function deleteCardAction(cardId: number) {
  try {
    // Get card info before deletion to get deckId for revalidation
    const { getCardById } = await import('@/db/queries/card-queries');
    const card = await getCardById(cardId);
    
    if (!card) {
      return { success: false, error: 'Card not found or unauthorized' };
    }
    
    const deckId = card.deckId;
    
    await deleteCard(cardId);
    
    revalidatePath('/dashboard');
    revalidatePath('/decks');
    revalidatePath(`/decks/${deckId}`);
    revalidatePath(`/decks/${deckId}/edit`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete card:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to delete card' };
  }
}
