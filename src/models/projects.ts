import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { ProjectDB, Project, ProjectFormData, ProjectStatus } from '../types/project';

let cachedDb: Db;
let cachedProjects: Collection<ProjectDB>;

async function connectToDatabase() {
  if (cachedDb && cachedProjects) {
    return { db: cachedDb, projectsCollection: cachedProjects };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedProjects = db.collection<ProjectDB>('projects');

  // Create indexes for better query performance
  await cachedProjects.createIndex({ title: 'text' });
  await cachedProjects.createIndex({ category: 1 });
  await cachedProjects.createIndex({ status: 1 });
  await cachedProjects.createIndex({ featured: 1 });
  await cachedProjects.createIndex({ technologies: 1 });

  return { db, projectsCollection: cachedProjects };
}

// Helper function to convert DB object to client-safe object
function toClientProject(project: ProjectDB): Project {
  return {
    ...project,
    _id: project._id.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

export const getProjects = async (
  category?: string,
  status?: ProjectStatus,
  featuredOnly: boolean = false
): Promise<Project[]> => {
  const { projectsCollection } = await connectToDatabase();
  const query: Filter<ProjectDB> = {};
  
  if (category) query.category = category;
  if (status) query.status = status;
  if (featuredOnly) query.featured = true;
  
  const projects = await projectsCollection.find(query).sort({ date: -1 }).toArray();
  return projects.map(toClientProject);
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const { projectsCollection } = await connectToDatabase();
  const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
  return project ? toClientProject(project) : null;
};

export const createProject = async (projectData: ProjectFormData): Promise<string> => {
  const { projectsCollection } = await connectToDatabase();
  
  let imageUrl = projectData.image || '';
  
  // Handle image based on the selected option
  if (projectData.imageOption === 'upload' && projectData.imageFile) {
    // Upload image to Cloudinary with cropping options
    const arrayBuffer = await projectData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${projectData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'projects',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' }, // Optimal for project banners
          { quality: 'auto' }
        ]
      }
    );
    imageUrl = uploadResult.secure_url;
  } else if (projectData.imageOption === 'url' && projectData.image) {
    // Use the provided URL directly
    imageUrl = projectData.image;
  }

  const now = new Date();
  const result = await projectsCollection.insertOne({
    title: projectData.title,
    image: imageUrl,
    category: projectData.category,
    status: projectData.status,
    description: projectData.description,
    longDescription: projectData.longDescription,
    technologies: projectData.technologies || [],
    highlights: projectData.highlights || [],
    date: projectData.date,
    featured: projectData.featured || false,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateProject = async (id: string, projectData: Partial<ProjectFormData>): Promise<number> => {
  const { projectsCollection } = await connectToDatabase();
  
  const updateData: Partial<ProjectDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (projectData.title !== undefined) updateData.title = projectData.title;
  if (projectData.category !== undefined) updateData.category = projectData.category;
  if (projectData.status !== undefined) updateData.status = projectData.status;
  if (projectData.description !== undefined) updateData.description = projectData.description;
  if (projectData.longDescription !== undefined) updateData.longDescription = projectData.longDescription;
  if (projectData.technologies !== undefined) updateData.technologies = projectData.technologies;
  if (projectData.highlights !== undefined) updateData.highlights = projectData.highlights;
  if (projectData.date !== undefined) updateData.date = projectData.date;
  if (projectData.featured !== undefined) updateData.featured = projectData.featured;

  // Handle image update based on the selected option
  if (projectData.imageOption === 'upload' && projectData.imageFile) {
    // Upload new image with cropping
    const arrayBuffer = await projectData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${projectData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'projects',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' },
          { quality: 'auto' }
        ]
      }
    );
    updateData.image = uploadResult.secure_url;
  } else if (projectData.imageOption === 'url' && projectData.image !== undefined) {
    // Use the provided URL directly
    updateData.image = projectData.image;
  } else if (projectData.image !== undefined) {
    // Fallback for backward compatibility
    updateData.image = projectData.image;
  }

  const result = await projectsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteProject = async (id: string): Promise<number> => {
  const { projectsCollection } = await connectToDatabase();
  
  const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
  if (project?.image) {
    const publicId = project.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`projects/${publicId}`);
    }
  }

  const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const toggleProjectFeatured = async (id: string, featured: boolean): Promise<number> => {
  const { projectsCollection } = await connectToDatabase();
  const result = await projectsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { featured, updatedAt: new Date() } }
  );
  return result.modifiedCount;
};