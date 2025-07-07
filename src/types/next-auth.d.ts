// types/next-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Session, User } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
      token: string;
    };
  }

  interface User {
    id: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    token: string;
  }
}