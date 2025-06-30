export interface Event {
  _id?: string;
  title: string;
  image: string;
  date: string; // ISO string
  location: string;
  attendees: number;
  category: string; // Matches category `id` from frontend
  description: string;
  highlights: string[];
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
