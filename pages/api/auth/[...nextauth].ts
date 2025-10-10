import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Define the session and JWT types with role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Here you would typically validate against your database
        // This is a placeholder - replace with actual authentication logic
        if (credentials.email === 'admin@example.com' && credentials.password === 'securepassword') {
          return {
            id: '1',
            name: 'Admin User',
            email: credentials.email,
            role: 'admin'
          };
        } else if (credentials.email === 'user@example.com' && credentials.password === 'userpassword') {
          return {
            id: '2',
            name: 'Regular User',
            email: credentials.email,
            role: 'user'
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    // Ensure JWT contains user ID and role
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Ensure session contains user ID and role
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'REPLACE_WITH_STRONG_SECRET_IN_PRODUCTION',
};

export default NextAuth(authOptions);