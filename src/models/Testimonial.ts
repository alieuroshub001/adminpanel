import mongoose, { Schema, models, model } from 'mongoose';

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    isFeatured: { type: Boolean, default: false },
    image: { type: String }, // optional image URL or Cloudinary reference
  },
  { timestamps: true }
);

const Testimonial = models.Testimonial || model('Testimonial', testimonialSchema);
export default Testimonial;
