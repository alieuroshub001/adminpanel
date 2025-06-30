export interface BlogPost {
  _id?: string;
  title: string;
  content: string;
  image: string;
  tags: string[]; // ✅ Add this line
  author: {
    name: string;
    bio: string;
    avatar?: string;
    social: {
      twitter?: string;
      linkedin?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}
