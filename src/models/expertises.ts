import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { ExpertiseDB, Expertise, ExpertiseFormData, ExpertiseCategory } from '../types/expertise';

let cachedDb: Db;
let cachedExpertises: Collection<ExpertiseDB>;

async function connectToDatabase() {
  if (cachedDb && cachedExpertises) {
    return { db: cachedDb, expertisesCollection: cachedExpertises };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedExpertises = db.collection<ExpertiseDB>('expertises');

  // Create indexes for better query performance
  await cachedExpertises.createIndex({ slug: 1 }, { unique: true });
  await cachedExpertises.createIndex({ title: 'text' });
  await cachedExpertises.createIndex({ category: 1 });
  await cachedExpertises.createIndex({ isFeatured: 1 });
  await cachedExpertises.createIndex({ path: 1 });

  return { db, expertisesCollection: cachedExpertises };
}

// Helper function to convert DB object to client-safe object
function toClientExpertise(expertise: ExpertiseDB): Expertise {
  return {
    ...expertise,
    _id: expertise._id.toString(),
    createdAt: expertise.createdAt.toISOString(),
    updatedAt: expertise.updatedAt.toISOString()
  };
}

async function uploadImageToCloudinary(file: File, folder: string, width: number, height: number) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  
  const uploadResult = await cloudinary.uploader.upload(
    `data:${file.type};base64,${base64String}`,
    { 
      folder,
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto' }
      ]
    }
  );
  return uploadResult.secure_url;
}

export const getExpertises = async (
  category?: ExpertiseCategory,
  featuredOnly: boolean = false
): Promise<Expertise[]> => {
  const { expertisesCollection } = await connectToDatabase();
  const query: Filter<ExpertiseDB> = {};
  
  if (category) query.category = category;
  if (featuredOnly) query.isFeatured = true;
  
  const expertises = await expertisesCollection.find(query).sort({ createdAt: -1 }).toArray();
  return expertises.map(toClientExpertise);
};

export const getExpertiseBySlug = async (slug: string): Promise<Expertise | null> => {
  const { expertisesCollection } = await connectToDatabase();
  const expertise = await expertisesCollection.findOne({ slug });
  return expertise ? toClientExpertise(expertise) : null;
};

export const getExpertiseById = async (id: string): Promise<Expertise | null> => {
  const { expertisesCollection } = await connectToDatabase();
  const expertise = await expertisesCollection.findOne({ _id: new ObjectId(id) });
  return expertise ? toClientExpertise(expertise) : null;
};

export const createExpertise = async (expertiseData: ExpertiseFormData): Promise<string> => {
  const { expertisesCollection } = await connectToDatabase();
  
  // Handle main image
  let imageUrl = expertiseData.image || '';
  if (expertiseData.imageFile) {
    imageUrl = await uploadImageToCloudinary(expertiseData.imageFile, 'expertise/main', 800, 600);
  }

  // Handle detail images
  let detailImages: string[] = [];
  if (expertiseData.detailImageFiles && expertiseData.detailImageFiles.length > 0) {
    for (const file of expertiseData.detailImageFiles) {
      const url = await uploadImageToCloudinary(file, 'expertise/detail', 1200, 800);
      detailImages.push(url);
    }
  } else if (expertiseData.detailImages) {
    detailImages = expertiseData.detailImages;
  }

  const now = new Date();
  const result = await expertisesCollection.insertOne({
    title: expertiseData.title,
    slug: expertiseData.slug,
    category: expertiseData.category,
    icon: expertiseData.icon,
    path: expertiseData.path,
    description: expertiseData.description,
    image: imageUrl,
    detailImages,
    isFeatured: expertiseData.isFeatured || false,
    insights: expertiseData.insights || [],
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateExpertise = async (id: string, expertiseData: Partial<ExpertiseFormData>): Promise<number> => {
  const { expertisesCollection } = await connectToDatabase();
  
  const updateData: Partial<ExpertiseDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (expertiseData.title !== undefined) updateData.title = expertiseData.title;
  if (expertiseData.slug !== undefined) updateData.slug = expertiseData.slug;
  if (expertiseData.category !== undefined) updateData.category = expertiseData.category;
  if (expertiseData.icon !== undefined) updateData.icon = expertiseData.icon;
  if (expertiseData.path !== undefined) updateData.path = expertiseData.path;
  if (expertiseData.description !== undefined) updateData.description = expertiseData.description;
  if (expertiseData.isFeatured !== undefined) updateData.isFeatured = expertiseData.isFeatured;
  if (expertiseData.insights !== undefined) updateData.insights = expertiseData.insights;

  // Handle main image update
  if (expertiseData.imageFile) {
    updateData.image = await uploadImageToCloudinary(expertiseData.imageFile, 'expertise/main', 800, 600);
  } else if (expertiseData.image !== undefined) {
    updateData.image = expertiseData.image;
  }

  // Handle detail images update
  if (expertiseData.detailImageFiles && expertiseData.detailImageFiles.length > 0) {
    const newDetailImages: string[] = [];
    for (const file of expertiseData.detailImageFiles) {
      const url = await uploadImageToCloudinary(file, 'expertise/detail', 1200, 800);
      newDetailImages.push(url);
    }
    updateData.detailImages = newDetailImages;
  } else if (expertiseData.detailImages !== undefined) {
    updateData.detailImages = expertiseData.detailImages;
  }

  const result = await expertisesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteExpertise = async (id: string): Promise<number> => {
  const { expertisesCollection } = await connectToDatabase();
  
  const expertise = await expertisesCollection.findOne({ _id: new ObjectId(id) });
  if (expertise) {
    // Delete main image
    if (expertise.image) {
      const publicId = expertise.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`expertise/main/${publicId}`);
      }
    }
    
    // Delete detail images
    if (expertise.detailImages && expertise.detailImages.length > 0) {
      for (const image of expertise.detailImages) {
        const publicId = image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`expertise/detail/${publicId}`);
        }
      }
    }
  }

  const result = await expertisesCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const toggleExpertiseFeatured = async (id: string, isFeatured: boolean): Promise<number> => {
  const { expertisesCollection } = await connectToDatabase();
  const result = await expertisesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isFeatured, updatedAt: new Date() } }
  );
  return result.modifiedCount;
};