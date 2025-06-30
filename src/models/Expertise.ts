import mongoose, { Schema, model, models } from 'mongoose';

const expertiseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: ['business', 'tech'], required: true },
    icon: { type: String, required: true },
    path: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true }, // card image
    detailImages: [{ type: String }], // optional for hero/insight visuals
    isFeatured: { type: Boolean, default: false },
    insights: [
      {
        title: String,
        description: String,
        image: String,
        metrics: [String],
      },
    ],
  },
  { timestamps: true }
);

const Expertise = models.Expertise || model('Expertise', expertiseSchema);
export default Expertise;
