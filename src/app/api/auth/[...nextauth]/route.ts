import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login, verifyOTP } from '@/models/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        try {
          // If OTP is provided, verify it first
          if (credentials?.otp) {
            const verification = await verifyOTP({
              email: credentials.email || '',
              otp: credentials.otp
            });
            
            if (!verification.success) {
              throw new Error(verification.message);
            }
          }

          // Then attempt login
          const result = await login({
            email: credentials?.email || '',
            password: credentials?.password || ''
          });

          if (result.success && result.user && result.token) {
            return {
              id: result.user._id,
              email: result.user.email,
              name: result.user.name,
              token: result.token
            };
          } else {
            throw new Error(result.message || 'Authentication failed');
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        token: token.token
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };