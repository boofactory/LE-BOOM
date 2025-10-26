import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
});

export interface NotionEvent {
  id: string;
  clientName: string;
  eventType?: string;
  eventDate?: Date;
  albumName?: string;
  status?: string;
  notionData: Record<string, any>;
  createdAt: Date;
}

export async function getNotionEvents(): Promise<NotionEvent[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID!;

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'État',
        status: {
          equals: 'En cours',
        },
      },
      sorts: [
        {
          property: 'Date évènement',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map((page: any) => {
      const props = page.properties;

      return {
        id: page.id,
        clientName: extractText(props['Client']) || 'Sans nom',
        eventType: extractSelect(props['Type d\'évenement']),
        eventDate: extractDate(props['Date évènement']),
        albumName: extractText(props['Nom album']),
        status: extractStatus(props['État']),
        notionData: props,
        createdAt: new Date(page.created_time),
      };
    });
  } catch (error) {
    console.error('Error fetching Notion events:', error);
    throw error;
  }
}

// Helper functions to extract data from Notion property types
function extractText(property: any): string | undefined {
  if (!property) return undefined;

  if (property.title && property.title.length > 0) {
    return property.title[0].plain_text;
  }

  if (property.rich_text && property.rich_text.length > 0) {
    return property.rich_text[0].plain_text;
  }

  return undefined;
}

function extractSelect(property: any): string | undefined {
  if (!property?.select) return undefined;
  return property.select.name;
}

function extractStatus(property: any): string | undefined {
  if (!property?.status) return undefined;
  return property.status.name;
}

function extractDate(property: any): Date | undefined {
  if (!property?.date?.start) return undefined;
  return new Date(property.date.start);
}

export { notion };
