import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { OAuthConfig } from 'next-auth/providers/oauth';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getOrCreateNextAuthSecret } from '@/lib/db-init';
import { getInfomaniakConfig } from '@/lib/infomaniak-config';

// Get NextAuth secret from database
let cachedSecret: string | null = null;

async function getNextAuthSecret(): Promise<string> {
  if (cachedSecret) {
    return cachedSecret;
  }

  cachedSecret = await getOrCreateNextAuthSecret();
  return cachedSecret;
}

// Infomaniak OIDC Provider
function InfomaniakProvider(options: { clientId: string; clientSecret: string }): OAuthConfig<any> {
  return {
    id: "infomaniak",
    name: "Infomaniak",
    type: "oauth",
    wellKnown: "https://login.infomaniak.com/.well-known/openid-configuration",
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
    checks: ["state"],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name || (profile.given_name + ' ' + profile.family_name),
        email: profile.email,
        image: profile.picture,
      };
    },
    clientId: options.clientId,
    clientSecret: options.clientSecret,
  };
}

/**
 * Build NextAuth options dynamically with DB-based Infomaniak config
 */
export async function buildAuthOptions(): Promise<NextAuthOptions> {
  // Récupérer la config Infomaniak depuis la DB
  const infomaniakConfig = await getInfomaniakConfig();

  const providers: any[] = [];

  // Ajouter le provider Infomaniak si configuré et activé
  if (infomaniakConfig.enabled && infomaniakConfig.clientId && infomaniakConfig.clientSecret) {
    console.log('[AUTH] Infomaniak OAuth enabled (source:', infomaniakConfig.source + ')');
    providers.push(InfomaniakProvider({
      clientId: infomaniakConfig.clientId,
      clientSecret: infomaniakConfig.clientSecret,
    }));
  }

  // Credentials Provider (toujours disponible)
  providers.push(CredentialsProvider({
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
  }));

  return {
    providers,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
    pages: {
      signIn: '/login',
    },
    callbacks: {
      async signIn({ user, account, profile }) {
        // 1. Credentials auth: vérifier active
        if (account?.provider === 'credentials') {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { username: user.email || '' },
              select: { active: true },
            });

            if (!dbUser?.active) {
              console.log('[AUTH] Credentials user not active:', user.email);
              return '/auth/error?error=AccountNotActive';
            }

            return true;
          } catch (error) {
            console.error('[AUTH] Error checking credentials user:', error);
            return '/auth/error?error=DatabaseError';
          }
        }

        // 2. Infomaniak OAuth flow
        if (account?.provider === 'infomaniak' && user.email) {
          try {
            // 2.1 Email domain validation
            if (!user.email.endsWith('@boofactory.ch')) {
              console.log('[AUTH] Invalid email domain:', user.email);
              return '/auth/error?error=InvalidDomain';
            }

            // 2.2 Check if user exists
            let dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            // 2.3 Auto-create user if first login
            if (!dbUser) {
              console.log('[AUTH] Creating new Infomaniak user:', user.email);

              dbUser = await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || user.email.split('@')[0],
                  infomaniakId: profile?.sub || (user as any).id,
                  role: 'VIEWER',
                  active: false,
                },
              });

              console.log('[AUTH] New user created, awaiting activation:', dbUser.email);
              return '/auth/error?error=AwaitingActivation';
            }

            // 2.4 Check if existing user is active
            if (!dbUser.active) {
              console.log('[AUTH] User exists but not active:', dbUser.email);
              return '/auth/error?error=AccountNotActive';
            }

            // 2.5 Update infomaniakId if missing
            if (!dbUser.infomaniakId && profile?.sub) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { infomaniakId: profile.sub },
              });
            }

            // 2.6 Load role for session
            (user as any).role = dbUser.role.toLowerCase();
            console.log('[AUTH] OAuth user verified:', dbUser.email, 'role:', dbUser.role);
            return true;
          } catch (error) {
            console.error('[AUTH] Error in OAuth signIn callback:', error);
            return '/auth/error?error=DatabaseError';
          }
        }

        return true;
      },
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
}

// Cache for authOptions (rebuilt on each process restart)
let cachedAuthOptions: NextAuthOptions | null = null;

/**
 * Get cached authOptions (for compatibility with existing code)
 * Note: This is built once at process start, so config changes require restart
 */
export async function getAuthOptions(): Promise<NextAuthOptions> {
  if (!cachedAuthOptions) {
    cachedAuthOptions = await buildAuthOptions();
  }
  return cachedAuthOptions;
}

// Backward compatibility: sync version for initial load (will be empty until async version is called)
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

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password set');
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          console.log('[AUTH] Login successful for:', credentials.username);

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
    maxAge: 30 * 24 * 60 * 60,
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
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-will-be-generated',
};
