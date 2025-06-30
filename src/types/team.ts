export interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
  longBio?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  location?: string;
  experience?: string;
  achievements?: string[];
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}
