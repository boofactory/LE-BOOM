import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Build handler with dynamic config
let handler: any = null;

async function getHandler() {
  if (!handler) {
    const authOptions = await getAuthOptions();
    handler = NextAuth(authOptions);
  }
  return handler;
}

export async function GET(req: NextRequest, context: any) {
  const h = await getHandler();
  return h(req, context);
}

export async function POST(req: NextRequest, context: any) {
  const h = await getHandler();
  return h(req, context);
}
