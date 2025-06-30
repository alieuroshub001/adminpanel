import mongoose, { Schema, model, models } from 'mongoose';

const clientLogoSchema = new Schema(
  {
    image: { type: String, required: true },
    imageSource: {
      type: String,
      enum: ['upload', 'link'],
      default: 'link',
    },
    line: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
  },
  { timestamps: true }
);

const ClientLogo = models.ClientLogo || model('ClientLogo', clientLogoSchema);
export default ClientLogo;
