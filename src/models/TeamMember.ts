import mongoose, { Schema, models, model } from 'mongoose';

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: true },
    bio: { type: String },
    longBio: { type: String },
    social: {
      linkedin: { type: String },
      twitter: { type: String },
      email: { type: String },
    },
    location: { type: String },
    experience: { type: String },
    achievements: [{ type: String }],
    skills: [{ type: String }],
  },
  { timestamps: true }
);

const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema);
export default TeamMember;
