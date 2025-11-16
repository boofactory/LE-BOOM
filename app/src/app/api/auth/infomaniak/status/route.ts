import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/response';
import { getInfomaniakConfig } from '@/lib/infomaniak-config';

/**
 * GET /api/auth/infomaniak/status
 * Check if Infomaniak OAuth is enabled (public endpoint for login page)
 */
export async function GET(request: NextRequest) {
  const config = await getInfomaniakConfig();

  return successResponse({
    enabled: config.enabled && !!config.clientId && !!config.clientSecret,
  });
}
