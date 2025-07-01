import { Collection, Db, ObjectId } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { ClientLogoDB, ClientLogo, ClientLogoFormData, LogoLine, ImageSource } from '../types/clientLogo';

let cachedDb: Db;
let cachedClientLogos: Collection<ClientLogoDB>;

async function connectToDatabase() {
  if (cachedDb && cachedClientLogos) {
    return { db: cachedDb, clientLogosCollection: cachedClientLogos };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedClientLogos = db.collection<ClientLogoDB>('clientLogos');

  // Create indexes for better query performance
  await cachedClientLogos.createIndex({ line: 1 });

  return { db, clientLogosCollection: cachedClientLogos };
}

// Helper function to convert DB object to client-safe object
function toClientClientLogo(clientLogo: ClientLogoDB): ClientLogo {
  return {
    ...clientLogo,
    _id: clientLogo._id.toString(),
    createdAt: clientLogo.createdAt.toISOString(),
    updatedAt: clientLogo.updatedAt.toISOString()
  };
}

export const getClientLogos = async (line?: LogoLine): Promise<ClientLogo[]> => {
  const { clientLogosCollection } = await connectToDatabase();
  const query = line ? { line } : {};
  
  const clientLogos = await clientLogosCollection.find(query).sort({ createdAt: -1 }).toArray();
  return clientLogos.map(toClientClientLogo);
};

export const getClientLogoById = async (id: string): Promise<ClientLogo | null> => {
  const { clientLogosCollection } = await connectToDatabase();
  const clientLogo = await clientLogosCollection.findOne({ _id: new ObjectId(id) });
  return clientLogo ? toClientClientLogo(clientLogo) : null;
};

export const createClientLogo = async (clientLogoData: ClientLogoFormData): Promise<string> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  let imageUrl = clientLogoData.image || '';
  let imageSource: ImageSource = clientLogoData.imageSource || 'link';
  
  // Handle image based on the selected option
  if (clientLogoData.imageFile) {
    // Upload image to Cloudinary with optimization
    const arrayBuffer = await clientLogoData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${clientLogoData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'client-logos',
        transformation: [
          { width: 200, height: 100, crop: 'scale' }, // Maintain aspect ratio
          { quality: 'auto' }
        ]
      }
    );
    imageUrl = uploadResult.secure_url;
    imageSource = 'upload';
  }

  const now = new Date();
  const result = await clientLogosCollection.insertOne({
    image: imageUrl,
    imageSource,
    line: clientLogoData.line,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateClientLogo = async (id: string, clientLogoData: Partial<ClientLogoFormData>): Promise<number> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  const updateData: Partial<ClientLogoDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (clientLogoData.line !== undefined) updateData.line = clientLogoData.line;

  // Handle image update
  if (clientLogoData.imageFile) {
    // Upload new image
    const arrayBuffer = await clientLogoData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${clientLogoData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'client-logos',
        transformation: [
          { width: 200, height: 100, crop: 'scale' },
          { quality: 'auto' }
        ]
      }
    );
    updateData.image = uploadResult.secure_url;
    updateData.imageSource = 'upload';
  } else if (clientLogoData.image !== undefined) {
    updateData.image = clientLogoData.image;
    updateData.imageSource = clientLogoData.imageSource || 'link';
  }

  const result = await clientLogosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteClientLogo = async (id: string): Promise<number> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  const clientLogo = await clientLogosCollection.findOne({ _id: new ObjectId(id) });
  if (clientLogo?.image && clientLogo.imageSource === 'upload') {
    const publicId = clientLogo.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`client-logos/${publicId}`);
    }
  }

  const result = await clientLogosCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const getClientLogosByLine = async (line: LogoLine): Promise<ClientLogo[]> => {
  const { clientLogosCollection } = await connectToDatabase();
  const clientLogos = await clientLogosCollection.find({ line }).sort({ createdAt: -1 }).toArray();
  return clientLogos.map(toClientClientLogo);
};