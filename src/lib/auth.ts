import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      username?: string;
    } & DefaultSession['user']
  }

  interface User {
    role: string;
    username?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Authorize attempt for email:', credentials?.email);
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter an email and password');
          }

          await dbConnect();
          console.log('Database connected successfully');

          const user = await User.findOne({ email: credentials.email });
          console.log('User found in DB:', user ? 'Yes' : 'No');

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password is valid:', isValid ? 'Yes' : 'No');

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username,
          };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Authentication failed';
          console.error('NextAuth authorize error:', message);
          throw new Error(message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret',
};
