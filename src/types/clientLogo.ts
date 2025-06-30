export interface ClientLogo {
  _id?: string;
  image: string; // Final image URL (from Cloudinary or direct link)
  imageSource?: 'upload' | 'link'; // To track input type
  line: 1 | 2 | 3 | 4; // Marquee line number
  createdAt?: string;
  updatedAt?: string;
}
