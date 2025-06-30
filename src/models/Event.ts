import mongoose, { Schema, model, models } from 'mongoose';

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: String, required: true }, // Use ISO format
    location: { type: String, required: true },
    attendees: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Event = models.Event || model('Event', eventSchema);
export default Event;
