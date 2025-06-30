import mongoose, { Schema, model, models } from 'mongoose';

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true }, // e.g. "Technology"
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      required: true,
    },
    location: { type: String, required: true },
    isLive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Job = models.Job || model('Job', jobSchema);
export default Job;
