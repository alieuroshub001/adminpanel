import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { TeamMemberDB, TeamMember, TeamMemberFormData, SocialLinks } from '../types/teamMember';

let cachedDb: Db;
let cachedTeamMembers: Collection<TeamMemberDB>;

async function connectToDatabase() {
  if (cachedDb && cachedTeamMembers) {
    return { db: cachedDb, teamMembersCollection: cachedTeamMembers };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedTeamMembers = db.collection<TeamMemberDB>('teamMembers');

  // Create indexes for better query performance
  await cachedTeamMembers.createIndex({ name: 'text' });
  await cachedTeamMembers.createIndex({ role: 1 });
  await cachedTeamMembers.createIndex({ 'social.linkedin': 1 });
  await cachedTeamMembers.createIndex({ 'social.twitter': 1 });

  return { db, teamMembersCollection: cachedTeamMembers };
}

// Helper function to convert DB object to client-safe object
function toClientTeamMember(member: TeamMemberDB): TeamMember {
  return {
    ...member,
    _id: member._id.toString(),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  };
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const { teamMembersCollection } = await connectToDatabase();
  const members = await teamMembersCollection.find().sort({ createdAt: -1 }).toArray();
  return members.map(toClientTeamMember);
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
  const { teamMembersCollection } = await connectToDatabase();
  const member = await teamMembersCollection.findOne({ _id: new ObjectId(id) });
  return member ? toClientTeamMember(member) : null;
};

export const createTeamMember = async (memberData: TeamMemberFormData): Promise<string> => {
  const { teamMembersCollection } = await connectToDatabase();
  
  let imageUrl = memberData.image || '';
  
  // Handle image based on the selected option
  if (memberData.imageOption === 'upload' && memberData.imageFile) {
    // Upload image to Cloudinary with cropping options
    const arrayBuffer = await memberData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${memberData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'team-members',
        transformation: [
          { width: 600, height: 600, crop: 'fill', gravity: 'face' }, // Square crop focused on face
          { quality: 'auto' }
        ]
      }
    );
    imageUrl = uploadResult.secure_url;
  } else if (memberData.imageOption === 'url' && memberData.image) {
    // Use the provided URL directly
    imageUrl = memberData.image;
  }

  const now = new Date();
  const result = await teamMembersCollection.insertOne({
    name: memberData.name,
    role: memberData.role,
    image: imageUrl,
    bio: memberData.bio,
    longBio: memberData.longBio,
    social: memberData.social,
    location: memberData.location,
    experience: memberData.experience,
    achievements: memberData.achievements || [],
    skills: memberData.skills || [],
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateTeamMember = async (id: string, memberData: Partial<TeamMemberFormData>): Promise<number> => {
  const { teamMembersCollection } = await connectToDatabase();
  
  const updateData: Partial<TeamMemberDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (memberData.name !== undefined) updateData.name = memberData.name;
  if (memberData.role !== undefined) updateData.role = memberData.role;
  if (memberData.bio !== undefined) updateData.bio = memberData.bio;
  if (memberData.longBio !== undefined) updateData.longBio = memberData.longBio;
  if (memberData.social !== undefined) updateData.social = memberData.social;
  if (memberData.location !== undefined) updateData.location = memberData.location;
  if (memberData.experience !== undefined) updateData.experience = memberData.experience;
  if (memberData.achievements !== undefined) updateData.achievements = memberData.achievements;
  if (memberData.skills !== undefined) updateData.skills = memberData.skills;

  // Handle image update based on the selected option
  if (memberData.imageOption === 'upload' && memberData.imageFile) {
    // Upload new image with cropping
    const arrayBuffer = await memberData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${memberData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'team-members',
        transformation: [
          { width: 600, height: 600, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      }
    );
    updateData.image = uploadResult.secure_url;
  } else if (memberData.imageOption === 'url' && memberData.image !== undefined) {
    // Use the provided URL directly
    updateData.image = memberData.image;
  } else if (memberData.image !== undefined) {
    // Fallback for backward compatibility
    updateData.image = memberData.image;
  }

  const result = await teamMembersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteTeamMember = async (id: string): Promise<number> => {
  const { teamMembersCollection } = await connectToDatabase();
  
  const member = await teamMembersCollection.findOne({ _id: new ObjectId(id) });
  if (member?.image) {
    const publicId = member.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`team-members/${publicId}`);
    }
  }

  const result = await teamMembersCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};