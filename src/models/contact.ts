import { Collection, Db, ObjectId } from 'mongodb';
import clientPromise from '../lib/db';
import { ContactCardDB, ContactCard, ContactCardFormData } from '../types/contactCard';

let cachedDb: Db;
let cachedContactCards: Collection<ContactCardDB>;

async function connectToDatabase() {
  if (cachedDb && cachedContactCards) {
    return { db: cachedDb, contactCardsCollection: cachedContactCards };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedContactCards = db.collection<ContactCardDB>('contactCards');

  // Create indexes for better query performance
  await cachedContactCards.createIndex({ title: 'text' });
  await cachedContactCards.createIndex({ icon: 1 });

  return { db, contactCardsCollection: cachedContactCards };
}

// Helper function to convert DB object to client-safe object
function toClientContactCard(contactCard: ContactCardDB): ContactCard {
  return {
    ...contactCard,
    _id: contactCard._id.toString(),
    createdAt: contactCard.createdAt.toISOString(),
    updatedAt: contactCard.updatedAt.toISOString()
  };
}

export const getContactCards = async (): Promise<ContactCard[]> => {
  const { contactCardsCollection } = await connectToDatabase();
  const contactCards = await contactCardsCollection.find().sort({ createdAt: -1 }).toArray();
  return contactCards.map(toClientContactCard);
};

export const getContactCardById = async (id: string): Promise<ContactCard | null> => {
  const { contactCardsCollection } = await connectToDatabase();
  const contactCard = await contactCardsCollection.findOne({ _id: new ObjectId(id) });
  return contactCard ? toClientContactCard(contactCard) : null;
};

export const createContactCard = async (contactCardData: ContactCardFormData): Promise<string> => {
  const { contactCardsCollection } = await connectToDatabase();

  const now = new Date();
  const result = await contactCardsCollection.insertOne({
    title: contactCardData.title,
    details: contactCardData.details,
    description: contactCardData.description,
    icon: contactCardData.icon,
    link: contactCardData.link,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateContactCard = async (id: string, contactCardData: Partial<ContactCardFormData>): Promise<number> => {
  const { contactCardsCollection } = await connectToDatabase();
  
  const updateData: Partial<ContactCardDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (contactCardData.title !== undefined) updateData.title = contactCardData.title;
  if (contactCardData.details !== undefined) updateData.details = contactCardData.details;
  if (contactCardData.description !== undefined) updateData.description = contactCardData.description;
  if (contactCardData.icon !== undefined) updateData.icon = contactCardData.icon;
  if (contactCardData.link !== undefined) updateData.link = contactCardData.link;

  const result = await contactCardsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteContactCard = async (id: string): Promise<number> => {
  const { contactCardsCollection } = await connectToDatabase();
  const result = await contactCardsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};