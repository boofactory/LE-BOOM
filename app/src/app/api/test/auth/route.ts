import { NextRequest } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import crypto from 'crypto';

/**
 * POST /api/test/auth
 * Authentifie avec l'API key de test et retourne un token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return errorResponse('API key is required', 400);
    }

    // Vérifier l'API key (depuis env var ou settings)
    const validApiKey = process.env.TEST_API_KEY;

    if (!validApiKey) {
      return errorResponse(
        'Test API is not configured. Please set TEST_API_KEY environment variable.',
        503
      );
    }

    if (apiKey !== validApiKey) {
      console.log('[TEST-AUTH] Invalid API key attempt');
      return unauthorizedResponse('Invalid API key');
    }

    // Générer un token simple (pour cette version basique)
    const token = crypto.randomBytes(32).toString('hex');

    console.log('[TEST-AUTH] Authentication successful, token generated');

    return successResponse({
      token,
      expiresIn: '24h',
      message: 'Authenticated successfully. Use this token in X-Test-Token header.',
    });
  } catch (error: any) {
    console.error('[TEST-AUTH] Error:', error);
    return errorResponse(`Authentication failed: ${error.message}`, 500);
  }
}

/**
 * GET /api/test/auth
 * Génère une nouvelle API key (admin uniquement via session NextAuth)
 */
export async function GET(request: NextRequest) {
  try {
    // Pour simplifier, on génère juste une clé aléatoire
    // Dans un vrai système, on vérifierait la session NextAuth ici
    const newApiKey = crypto.randomBytes(32).toString('hex');

    return successResponse({
      apiKey: newApiKey,
      message: 'Save this API key in your TEST_API_KEY environment variable',
      instructions: [
        '1. Add TEST_API_KEY to your Portainer stack environment variables',
        '2. Restart the stack',
        '3. Use this key to authenticate test API calls',
      ],
    });
  } catch (error: any) {
    console.error('[TEST-AUTH] Error generating API key:', error);
    return errorResponse(`Failed to generate API key: ${error.message}`, 500);
  }
}
