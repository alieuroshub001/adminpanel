import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { EventDB, Event, EventFormData } from '../types/event';

let cachedDb: Db;
let cachedEvents: Collection<EventDB>;

async function connectToDatabase() {
  if (cachedDb && cachedEvents) {
    return { db: cachedDb, eventsCollection: cachedEvents };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedEvents = db.collection<EventDB>('events');

  // Create indexes for better query performance
  await cachedEvents.createIndex({ category: 1 });
  await cachedEvents.createIndex({ date: 1 });
  await cachedEvents.createIndex({ isFeatured: 1 });

  // Unified text index for title and location
  await cachedEvents.createIndex(
    { title: 'text', location: 'text' },
    { name: 'text_index', default_language: 'english' }
  );

  return { db, eventsCollection: cachedEvents };
}

// Helper function to convert DB object to client-safe object
function toClientEvent(event: EventDB): Event {
  return {
    ...event,
    _id: event._id.toString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  };
}

export const getEvents = async (
  category?: string,
  featuredOnly: boolean = false,
  upcomingOnly: boolean = false
): Promise<Event[]> => {
  const { eventsCollection } = await connectToDatabase();
  const query: Filter<EventDB> = {};
  
  if (category) query.category = category;
  if (featuredOnly) query.isFeatured = true;
  if (upcomingOnly) query.date = { $gte: new Date().toISOString() };
  
  const events = await eventsCollection.find(query).sort({ date: 1 }).toArray();
  return events.map(toClientEvent);
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const { eventsCollection } = await connectToDatabase();
  const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
  return event ? toClientEvent(event) : null;
};

export const createEvent = async (eventData: EventFormData): Promise<string> => {
  const { eventsCollection } = await connectToDatabase();
  
  let imageUrl = eventData.image || '';

  if (eventData.imageOption === 'upload' && eventData.imageFile) {
    const arrayBuffer = await eventData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const uploadResult = await cloudinary.uploader.upload(
      `data:${eventData.imageFile.type};base64,${base64String}`,
      {
        folder: 'events',
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto' }
        ]
      }
    );
    imageUrl = uploadResult.secure_url;
  } else if (eventData.imageOption === 'url' && eventData.image) {
    imageUrl = eventData.image;
  }

  const now = new Date();
  const result = await eventsCollection.insertOne({
    title: eventData.title,
    image: imageUrl,
    date: eventData.date,
    location: eventData.location,
    attendees: eventData.attendees || 0,
    category: eventData.category,
    description: eventData.description,
    highlights: eventData.highlights || [],
    isFeatured: eventData.isFeatured || false,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });

  return result.insertedId.toString();
};

export const updateEvent = async (id: string, eventData: Partial<EventFormData>): Promise<number> => {
  const { eventsCollection } = await connectToDatabase();

  const updateData: Partial<EventDB> = {
    updatedAt: new Date(),
  };

  if (eventData.title !== undefined) updateData.title = eventData.title;
  if (eventData.date !== undefined) updateData.date = eventData.date;
  if (eventData.location !== undefined) updateData.location = eventData.location;
  if (eventData.attendees !== undefined) updateData.attendees = eventData.attendees;
  if (eventData.category !== undefined) updateData.category = eventData.category;
  if (eventData.description !== undefined) updateData.description = eventData.description;
  if (eventData.highlights !== undefined) updateData.highlights = eventData.highlights;
  if (eventData.isFeatured !== undefined) updateData.isFeatured = eventData.isFeatured;

  if (eventData.imageOption === 'upload' && eventData.imageFile) {
    const arrayBuffer = await eventData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const uploadResult = await cloudinary.uploader.upload(
      `data:${eventData.imageFile.type};base64,${base64String}`,
      {
        folder: 'events',
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto' }
        ]
      }
    );
    updateData.image = uploadResult.secure_url;
  } else if (eventData.imageOption === 'url' && eventData.image !== undefined) {
    updateData.image = eventData.image;
  } else if (eventData.image !== undefined) {
    updateData.image = eventData.image;
  }

  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return result.modifiedCount;
};

export const deleteEvent = async (id: string): Promise<number> => {
  const { eventsCollection } = await connectToDatabase();

  const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
  if (event?.image) {
    const publicId = event.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`events/${publicId}`);
    }
  }

  const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const toggleEventFeatured = async (id: string, isFeatured: boolean): Promise<number> => {
  const { eventsCollection } = await connectToDatabase();
  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isFeatured, updatedAt: new Date() } }
  );
  return result.modifiedCount;
};

export const incrementEventAttendees = async (id: string): Promise<number> => {
  const { eventsCollection } = await connectToDatabase();
  const result = await eventsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { attendees: 1 }, $set: { updatedAt: new Date() } }
  );
  return result.modifiedCount;
};
