import { prisma } from '@/lib/prisma';

/**
 * Récupère intelligemment les credentials Infomaniak OAuth
 * Ignore les valeurs placeholder des env vars et utilise la DB en priorité
 */
export async function getInfomaniakConfig(): Promise<{
  clientId: string | null;
  clientSecret: string | null;
  enabled: boolean;
  source: 'env' | 'settings';
}> {
  // Récupérer depuis les settings en DB
  const clientIdSetting = await prisma.setting.findUnique({
    where: { key: 'INFOMANIAK_CLIENT_ID' },
  });
  const clientSecretSetting = await prisma.setting.findUnique({
    where: { key: 'INFOMANIAK_CLIENT_SECRET' },
  });
  const enabledSetting = await prisma.setting.findUnique({
    where: { key: 'INFOMANIAK_ENABLED' },
  });

  let clientId: string | null = null;
  let clientSecret: string | null = null;
  let enabled = false;
  let source: 'env' | 'settings' = 'settings';

  // Si les settings existent en DB et ne sont pas vides, les utiliser
  if (clientIdSetting?.value && clientIdSetting.value.trim() !== '') {
    clientId = clientIdSetting.value.trim();
  }
  if (clientSecretSetting?.value && clientSecretSetting.value.trim() !== '') {
    clientSecret = clientSecretSetting.value.trim();
  }
  if (enabledSetting?.value) {
    enabled = enabledSetting.value.toLowerCase() === 'true';
  }

  // Sinon, fallback sur env vars (seulement si pas placeholder)
  if (!clientId) {
    const envClientId = process.env.INFOMANIAK_CLIENT_ID;
    if (envClientId && envClientId !== 'changeme' && envClientId.trim() !== '') {
      clientId = envClientId.trim();
      source = 'env';
    }
  }
  if (!clientSecret) {
    const envClientSecret = process.env.INFOMANIAK_CLIENT_SECRET;
    if (envClientSecret && envClientSecret !== 'changeme' && envClientSecret.trim() !== '') {
      clientSecret = envClientSecret.trim();
      source = 'env';
    }
  }
  if (!enabled && enabledSetting === null) {
    // Si pas de setting en DB, vérifier l'env var
    const envEnabled = process.env.NEXT_PUBLIC_INFOMANIAK_ENABLED;
    if (envEnabled && envEnabled.toLowerCase() === 'true') {
      enabled = true;
      source = 'env';
    }
  }

  return { clientId, clientSecret, enabled, source };
}
