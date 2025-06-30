export interface Project {
  _id?: string;
  title: string;
  image: string; // Project banner image
  category: string; // e.g. "Web App", "Mobile App"
  status: 'completed' | 'ongoing' | 'upcoming'; // can be enum-limited
  description: string; // short description for card
  longDescription: string; // full detail for modal
  technologies: string[]; // tags
  highlights: string[]; // key features list in modal
  date: string; // ISO format date
  featured?: boolean; // true for featured grid
  createdAt?: string;
  updatedAt?: string;
}
