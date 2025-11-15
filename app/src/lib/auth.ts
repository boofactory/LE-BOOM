import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { OAuthConfig } from 'next-auth/providers/oauth';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getOrCreateNextAuthSecret } from '@/lib/db-init';

// Get NextAuth secret from database
let cachedSecret: string | null = null;

async function getNextAuthSecret(): Promise<string> {
  if (cachedSecret) {
    return cachedSecret;
  }

  cachedSecret = await getOrCreateNextAuthSecret();
  return cachedSecret;
}

// Infomaniak OAuth Provider
function InfomaniakProvider(options: { clientId: string; clientSecret: string }): OAuthConfig<any> {
  return {
    id: "infomaniak",
    name: "Infomaniak",
    type: "oauth",
    wellKnown: undefined,
    authorization: {
      url: "https://login.infomaniak.com/authorize",
      params: {
        scope: "openid email profile",
        response_type: "code",
      },
    },
    token: "https://login.infomaniak.com/token",
    userinfo: "https://login.infomaniak.com/oauth2/userinfo",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name || profile.given_name + ' ' + profile.family_name,
        email: profile.email,
        image: profile.picture,
      };
    },
    clientId: options.clientId,
    clientSecret: options.clientSecret,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Infomaniak OAuth (if credentials are configured)
    ...(process.env.INFOMANIAK_CLIENT_ID && process.env.INFOMANIAK_CLIENT_SECRET
      ? [InfomaniakProvider({
          clientId: process.env.INFOMANIAK_CLIENT_ID,
          clientSecret: process.env.INFOMANIAK_CLIENT_SECRET,
        })]
      : []),
    // Credentials Provider (fallback)
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

        try {
          // Find user in database by username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password set');
            return null;
          }

          // Verify password with bcrypt
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          console.log('[AUTH] Login successful for:', credentials.username);

          // Return user object
          return {
            id: user.id.toString(),
            name: user.name || user.username,
            email: user.email,
            role: user.role.toLowerCase(),
          };
        } catch (error) {
          console.error('[AUTH] Error during authentication:', error);
          return null;
        }
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
  // Use env var as fallback, will be set by getOrCreateNextAuthSecret() on first use
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-will-be-generated',
};
