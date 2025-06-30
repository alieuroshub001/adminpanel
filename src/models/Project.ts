import mongoose, { Schema, models, model } from 'mongoose';

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['completed', 'ongoing', 'upcoming'],
      required: true,
    },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    technologies: [{ type: String, required: true }],
    highlights: [{ type: String }],
    date: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = models.Project || model('Project', projectSchema);
export default Project;
