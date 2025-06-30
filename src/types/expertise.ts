export interface Expertise {
  _id?: string;
  title: string;
  slug: string;
  category: 'business' | 'tech';
  icon: string;
  path: string;
  description?: string;
  image: string; // card image
  detailImages?: string[]; // optional for detailed visuals
  isFeatured?: boolean;
  insights?: {
    title: string;
    description: string;
    image: string;
    metrics: string[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}
