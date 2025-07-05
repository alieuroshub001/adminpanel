import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import { JobDB, Job, JobFormData, JobType } from '../types/job';

let cachedDb: Db;
let cachedJobs: Collection<JobDB>;

async function connectToDatabase() {
  if (cachedDb && cachedJobs) {
    return { db: cachedDb, jobsCollection: cachedJobs };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedJobs = db.collection<JobDB>('jobs');

  // ✅ Create compound text index once (title + description)
  try {
    await cachedJobs.createIndex(
      { title: 'text', description: 'text' },
      { name: 'title_description_text', default_language: 'english' }
    );
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'codeName' in err && (err as { codeName?: string }).codeName !== 'IndexOptionsConflict') {
      console.error('Index creation error:', err);
      throw err;
    }
  }

  // ✅ Safe non-text indexes
  await Promise.all([
    cachedJobs.createIndex({ department: 1 }),
    cachedJobs.createIndex({ type: 1 }),
  ]);

  return { db, jobsCollection: cachedJobs };
}


// Helper function to convert DB object to client-safe object
function toClientJob(job: JobDB): Job {
  return {
    ...job,
    _id: job._id.toString(),
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString()
  };
}

export const getJobs = async (
  department?: string,
  type?: JobType,
  searchQuery?: string
): Promise<Job[]> => {
  const { jobsCollection } = await connectToDatabase();
  const query: Filter<JobDB> = {};
  
  if (department) query.department = department;
  if (type) query.type = type;
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  
  const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).toArray();
  return jobs.map(toClientJob);
};

export const getJobById = async (id: string): Promise<Job | null> => {
  const { jobsCollection } = await connectToDatabase();
  const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
  return job ? toClientJob(job) : null;
};

export const createJob = async (jobData: JobFormData): Promise<string> => {
  const { jobsCollection } = await connectToDatabase();

  const now = new Date();
  const result = await jobsCollection.insertOne({
    title: jobData.title,
    description: jobData.description,
    department: jobData.department,
    type: jobData.type,
    location: jobData.location,
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateJob = async (id: string, jobData: Partial<JobFormData>): Promise<number> => {
  const { jobsCollection } = await connectToDatabase();
  
  const updateData: Partial<JobDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (jobData.title !== undefined) updateData.title = jobData.title;
  if (jobData.description !== undefined) updateData.description = jobData.description;
  if (jobData.department !== undefined) updateData.department = jobData.department;
  if (jobData.type !== undefined) updateData.type = jobData.type;
  if (jobData.location !== undefined) updateData.location = jobData.location;

  const result = await jobsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteJob = async (id: string): Promise<number> => {
  const { jobsCollection } = await connectToDatabase();
  const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};