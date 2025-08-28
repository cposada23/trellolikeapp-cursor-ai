import db from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc, count } from 'drizzle-orm';
import type { CreateDeckInput, UpdateDeckInput } from '@/lib/schemas';

export async function getUserDecks() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));
}

export async function getUserDecksWithCardCounts() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  return await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: count(cardsTable.id),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id, decksTable.name, decksTable.description, decksTable.createdAt, decksTable.updatedAt)
    .orderBy(desc(decksTable.createdAt));
}

export async function getDeckById(deckId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const deck = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
    
  return deck[0] || null;
}

export async function getDeckWithCards(deckId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  return await db.query.decksTable.findFirst({
    where: and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ),
    with: { cards: true }
  });
}

export async function createDeck(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const result = await db
    .insert(decksTable)
    .values({
      ...input,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  return result[0];
}

export async function updateDeck(deckId: number, input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const result = await db
    .update(decksTable)
    .set({ 
      ...input, 
      updatedAt: new Date() 
    })
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
    
  return result[0] || null;
}

export async function deleteDeck(deckId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  await db
    .delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
}
