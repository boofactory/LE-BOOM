import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[AUTH] Login attempt for username:', credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        const adminUsername = process.env.ADMIN_USERNAME || 'boo-team';
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminPasswordHash) {
          console.error('[AUTH] ADMIN_PASSWORD_HASH not configured');
          return null;
        }

        // Vérifier username
        if (credentials.username !== adminUsername) {
          console.log('[AUTH] Invalid username');
          return null;
        }

        // Vérifier password avec bcrypt
        const isValid = await bcrypt.compare(credentials.password, adminPasswordHash);

        if (!isValid) {
          console.log('[AUTH] Invalid password');
          return null;
        }

        console.log('[AUTH] Login successful for:', credentials.username);

        // Retourner user object
        return {
          id: '1',
          name: 'BooFactory Team',
          email: 'tech@boofactory.ch',
          role: 'admin',
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
