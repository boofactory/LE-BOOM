import { prisma } from '@/lib/prisma';

/**
 * Récupère intelligemment les credentials Notion
 * Ignore les valeurs placeholder des env vars et utilise la DB en priorité
 */
export async function getNotionCredentials(): Promise<{
  token: string | null;
  databaseId: string | null;
  source: 'env' | 'settings';
}> {
  // Récupérer depuis les settings en DB
  const tokenSetting = await prisma.setting.findUnique({
    where: { key: 'NOTION_API_TOKEN' },
  });
  const dbSetting = await prisma.setting.findUnique({
    where: { key: 'NOTION_DATABASE_ID' },
  });

  let token: string | null = null;
  let databaseId: string | null = null;
  let source: 'env' | 'settings' = 'settings';

  // Si les settings existent en DB et ne sont pas vides, les utiliser
  if (tokenSetting?.value && tokenSetting.value.trim() !== '') {
    token = tokenSetting.value.trim();
  }
  if (dbSetting?.value && dbSetting.value.trim() !== '') {
    databaseId = dbSetting.value.trim();
  }

  // Sinon, fallback sur env vars (seulement si pas placeholder)
  if (!token) {
    const envToken = process.env.NOTION_API_TOKEN;
    if (envToken && envToken !== 'placeholder' && envToken.trim() !== '') {
      token = envToken.trim();
      source = 'env';
    }
  }
  if (!databaseId) {
    const envDb = process.env.NOTION_DATABASE_ID;
    if (envDb && envDb !== 'placeholder' && envDb.trim() !== '') {
      databaseId = envDb.trim();
      source = 'env';
    }
  }

  return { token, databaseId, source };
}
