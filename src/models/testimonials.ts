import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { TestimonialDB, Testimonial, TestimonialFormData } from '../types/testimonial';

let cachedDb: Db;
let cachedTestimonials: Collection<TestimonialDB>;

async function connectToDatabase() {
  if (cachedDb && cachedTestimonials) {
    return { db: cachedDb, testimonialsCollection: cachedTestimonials };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedTestimonials = db.collection<TestimonialDB>('testimonials');

  await cachedTestimonials.createIndex({ name: 'text' });
  await cachedTestimonials.createIndex({ rating: 1 });
  await cachedTestimonials.createIndex({ isFeatured: 1 });

  return { db, testimonialsCollection: cachedTestimonials };
}

function toClientTestimonial(testimonial: TestimonialDB): Testimonial {
  return {
    ...testimonial,
    _id: testimonial._id.toString(),
    createdAt: testimonial.createdAt.toISOString(),
    updatedAt: testimonial.updatedAt.toISOString(),
  };
}

export const getTestimonials = async (featuredOnly: boolean = false): Promise<Testimonial[]> => {
  const { testimonialsCollection } = await connectToDatabase();
  const query: Filter<TestimonialDB> = {};

  if (featuredOnly) query.isFeatured = true;

  const testimonials = await testimonialsCollection.find(query).sort({ createdAt: -1 }).toArray();
  return testimonials.map(toClientTestimonial);
};

export const getTestimonialById = async (id: string): Promise<Testimonial | null> => {
  const { testimonialsCollection } = await connectToDatabase();
  const testimonial = await testimonialsCollection.findOne({ _id: new ObjectId(id) });
  return testimonial ? toClientTestimonial(testimonial) : null;
};

export const createTestimonial = async (testimonialData: TestimonialFormData): Promise<string> => {
  const { testimonialsCollection } = await connectToDatabase();

  let imageUrl = '';

  // Upload image if selected as upload
  if (testimonialData.imageOption === 'upload' && testimonialData.imageFile) {
    const arrayBuffer = await testimonialData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const uploadResult = await cloudinary.uploader.upload(
      `data:${testimonialData.imageFile.type};base64,${base64String}`,
      {
        folder: 'testimonials'
        // No transformations, retain original image as-is
      }
    );
    imageUrl = uploadResult.secure_url;
  } else if (testimonialData.imageOption === 'url' && testimonialData.image) {
    imageUrl = testimonialData.image;
  }

  const now = new Date();
  const result = await testimonialsCollection.insertOne({
    name: testimonialData.name,
    role: testimonialData.role,
    content: testimonialData.content,
    rating: testimonialData.rating,
    isFeatured: testimonialData.isFeatured || false,
    image: imageUrl || undefined,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });

  return result.insertedId.toString();
};

export const updateTestimonial = async (id: string, testimonialData: Partial<TestimonialFormData>): Promise<number> => {
  const { testimonialsCollection } = await connectToDatabase();

  const updateData: Partial<TestimonialDB> = {
    updatedAt: new Date(),
  };

  if (testimonialData.name !== undefined) updateData.name = testimonialData.name;
  if (testimonialData.role !== undefined) updateData.role = testimonialData.role;
  if (testimonialData.content !== undefined) updateData.content = testimonialData.content;
  if (testimonialData.rating !== undefined) updateData.rating = testimonialData.rating;
  if (testimonialData.isFeatured !== undefined) updateData.isFeatured = testimonialData.isFeatured;

  if (testimonialData.imageOption === 'upload' && testimonialData.imageFile) {
    const arrayBuffer = await testimonialData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const uploadResult = await cloudinary.uploader.upload(
      `data:${testimonialData.imageFile.type};base64,${base64String}`,
      {
        folder: 'testimonials'
        // No cropping or resizing
      }
    );
    updateData.image = uploadResult.secure_url;
  } else if (testimonialData.imageOption === 'url' && testimonialData.image !== undefined) {
    updateData.image = testimonialData.image;
  } else if (testimonialData.image !== undefined) {
    updateData.image = testimonialData.image;
  }

  const result = await testimonialsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return result.modifiedCount;
};

export const deleteTestimonial = async (id: string): Promise<number> => {
  const { testimonialsCollection } = await connectToDatabase();

  const testimonial = await testimonialsCollection.findOne({ _id: new ObjectId(id) });
  if (testimonial?.image) {
    const publicId = testimonial.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`testimonials/${publicId}`);
    }
  }

  const result = await testimonialsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const toggleTestimonialFeatured = async (id: string, isFeatured: boolean): Promise<number> => {
  const { testimonialsCollection } = await connectToDatabase();
  const result = await testimonialsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isFeatured, updatedAt: new Date() } }
  );
  return result.modifiedCount;
};
