import { Collection, Db, ObjectId } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { 
  ClientLogoDB, 
  ClientLogo, 
  ClientLogoFormData, 
  BulkClientLogoFormData,
  BulkCreateResponse,
  LogoLine, 
  ImageSource 
} from '../types/clientLogo';

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

// Helper function to upload image to Cloudinary
async function uploadImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  
  const uploadResult = await cloudinary.uploader.upload(
    `data:${file.type};base64,${base64String}`,
    { 
      folder: 'client-logos',
      transformation: [
        { quality: 'auto' }
      ]
    }
  );
  
  return uploadResult.secure_url;
}

// Helper function to delete image from Cloudinary
async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  const publicId = imageUrl.split('/').pop()?.split('.')[0];
  if (publicId) {
    await cloudinary.uploader.destroy(`client-logos/${publicId}`);
  }
}

// ========== SINGLE LOGO OPERATIONS ========== //

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
  
  if (clientLogoData.imageFile) {
    imageUrl = await uploadImageToCloudinary(clientLogoData.imageFile);
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
    updateData.image = await uploadImageToCloudinary(clientLogoData.imageFile);
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
    await deleteImageFromCloudinary(clientLogo.image);
  }

  const result = await clientLogosCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const getClientLogosByLine = async (line: LogoLine): Promise<ClientLogo[]> => {
  const { clientLogosCollection } = await connectToDatabase();
  const clientLogos = await clientLogosCollection.find({ line }).sort({ createdAt: -1 }).toArray();
  return clientLogos.map(toClientClientLogo);
};

// ========== BULK LOGO OPERATIONS (RECOMMENDED) ========== //

export const createMultipleClientLogosOptimized = async (bulkData: BulkClientLogoFormData): Promise<BulkCreateResponse> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  const logosToInsert: ClientLogoDB[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  
  // Process all uploads first with error handling
  for (let i = 0; i < bulkData.logos.length; i++) {
    try {
      const logoData = bulkData.logos[i];
      let imageUrl = logoData.image || '';
      let imageSource: ImageSource = logoData.imageSource || 'link';
      
      // Validate required fields
      if (!logoData.line) {
        throw new Error('Line is required');
      }
      
      if (!logoData.image && !logoData.imageFile) {
        throw new Error('Either image URL or image file is required');
      }
      
      // Handle file upload
      if (logoData.imageFile) {
        imageUrl = await uploadImageToCloudinary(logoData.imageFile);
        imageSource = 'upload';
      }

      const now = new Date();
      logosToInsert.push({
        image: imageUrl,
        imageSource,
        line: logoData.line,
        createdAt: now,
        updatedAt: now,
        _id: new ObjectId()
      });
    } catch (error) {
      errors.push({
        index: i,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  // Bulk insert all successful logos
  let insertedIds: string[] = [];
  if (logosToInsert.length > 0) {
    try {
      const result = await clientLogosCollection.insertMany(logosToInsert, { ordered: false });
      insertedIds = Object.values(result.insertedIds).map(id => id.toString());
    } catch (bulkError) {
      // If bulk insert fails, fall back to individual inserts
      console.warn('Bulk insert failed, falling back to individual inserts:', bulkError);
      
      for (let i = 0; i < logosToInsert.length; i++) {
        try {
          const result = await clientLogosCollection.insertOne(logosToInsert[i]);
          insertedIds.push(result.insertedId.toString());
        } catch (individualError) {
          errors.push({
            index: i,
            error: individualError instanceof Error ? individualError.message : 'Failed to insert logo'
          });
        }
      }
    }
  }
  
  return {
    insertedIds,
    successCount: insertedIds.length,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Bulk delete operation
export const deleteMultipleClientLogos = async (ids: string[]): Promise<{ deletedCount: number; errors?: Array<{ id: string; error: string }> }> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  const errors: Array<{ id: string; error: string }> = [];
  let deletedCount = 0;
  
  // First, get all logos to delete their images from Cloudinary
  const objectIds = ids.map(id => {
    try {
      return new ObjectId(id);
    } catch {
      errors.push({ id, error: 'Invalid ObjectId format' });
      return null;
    }
  }).filter(Boolean) as ObjectId[];
  
  if (objectIds.length === 0) {
    return { deletedCount: 0, errors };
  }
  
  try {
    // Get logos that have uploaded images
    const logosWithImages = await clientLogosCollection.find({
      _id: { $in: objectIds },
      imageSource: 'upload'
    }).toArray();
    
    // Delete images from Cloudinary
    const deletePromises = logosWithImages.map(async (logo) => {
      try {
        if (logo.image) {
          await deleteImageFromCloudinary(logo.image);
        }
      } catch (error) {
        console.warn(`Failed to delete image for logo ${logo._id}:`, error);
      }
    });
    
    await Promise.allSettled(deletePromises);
    
    // Delete logos from database
    const result = await clientLogosCollection.deleteMany({
      _id: { $in: objectIds }
    });
    
    deletedCount = result.deletedCount;
  } catch (error) {
    errors.push({
      id: 'bulk_operation',
      error: error instanceof Error ? error.message : 'Bulk delete failed'
    });
  }
  
  return {
    deletedCount,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Get logos with pagination for better performance with large datasets
export const getClientLogosWithPagination = async (
  line?: LogoLine,
  page: number = 1,
  limit: number = 20
): Promise<{ logos: ClientLogo[]; total: number; hasMore: boolean }> => {
  const { clientLogosCollection } = await connectToDatabase();
  const query = line ? { line } : {};
  
  const skip = (page - 1) * limit;
  
  const [logos, total] = await Promise.all([
    clientLogosCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    clientLogosCollection.countDocuments(query)
  ]);
  
  return {
    logos: logos.map(toClientClientLogo),
    total,
    hasMore: skip + logos.length < total
  };
};

// Utility function to get logos count by line
export const getClientLogosCountByLine = async (): Promise<Record<LogoLine, number>> => {
  const { clientLogosCollection } = await connectToDatabase();
  
  const pipeline = [
    {
      $group: {
        _id: '$line',
        count: { $sum: 1 }
      }
    }
  ];
  
  const results = await clientLogosCollection.aggregate(pipeline).toArray();
  
  // Initialize all lines with 0
  const counts: Record<LogoLine, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  
  // Fill in actual counts
  results.forEach(result => {
    if (result._id >= 1 && result._id <= 4) {
      counts[result._id as LogoLine] = result.count;
    }
  });
  
  return counts;
};