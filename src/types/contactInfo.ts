export interface ContactCard {
  _id?: string;
  title: string;
  details: string;
  description: string;
  icon: string; // Store icon name as a string (e.g., "Mail", "Phone")
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}
