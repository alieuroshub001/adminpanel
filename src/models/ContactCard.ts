import mongoose, { Schema, model, models } from 'mongoose';

const contactCardSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // e.g. "Mail", "Phone", etc.
    link: { type: String },
  },
  { timestamps: true }
);

const ContactCard = models.ContactCard || model('ContactCard', contactCardSchema);
export default ContactCard;
