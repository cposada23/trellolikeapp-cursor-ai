import db from '@/db';
import { cardsTable, decksTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateCardInput, UpdateCardInput } from '@/lib/schemas';

export async function getCardsByDeck(deckId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  // Verify user owns the deck first
  const deck = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
    
  if (!deck.length) throw new Error('Deck not found or unauthorized');
  
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.createdAt));
}

export async function getCardById(cardId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  // Verify user owns the deck that contains this card
  const cardWithDeck = await db
    .select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
    
  return cardWithDeck.length > 0 ? cardWithDeck[0].cards : null;
}

export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  // Verify user owns the deck
  const deck = await db
    .select({ id: decksTable.id })
    .from(decksTable)
    .where(and(
      eq(decksTable.id, input.deckId),
      eq(decksTable.userId, userId)
    ));
    
  if (!deck.length) throw new Error('Deck not found or unauthorized');
  
  const result = await db
    .insert(cardsTable)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  return result[0];
}

export async function updateCard(cardId: number, input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  // Verify user owns the deck that contains this card
  const cardWithDeck = await db
    .select({ cardId: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
    
  if (!cardWithDeck.length) throw new Error('Card not found or unauthorized');
  
  const result = await db
    .update(cardsTable)
    .set({ 
      ...input, 
      updatedAt: new Date() 
    })
    .where(eq(cardsTable.id, cardId))
    .returning();
    
  return result[0] || null;
}

export async function deleteCard(cardId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  // Verify user owns the deck that contains this card
  const cardWithDeck = await db
    .select({ cardId: cardsTable.id })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(
      eq(cardsTable.id, cardId),
      eq(decksTable.userId, userId)
    ));
    
  if (!cardWithDeck.length) throw new Error('Card not found or unauthorized');
  
  await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}
