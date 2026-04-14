import { getAllActiveClients } from '../db/client';
import { searchAllPlatforms } from '../api/index';
import { diffProperties, saveSearchSnapshot } from '../db/search';
import { sendEmailAlert } from '../notifier/email';
import { sendSmsAlert } from '../notifier/sms';

export async function runAllClientSearches(): Promise<void> {
  const clients = await getAllActiveClients();
  console.log(`[Runner] Processing ${clients.length} active clients`);

  for (const client of clients) {
    try {
      console.log(`[Runner] Searching for: ${client.name}`);

      const params = {
        propertyType: client.propertyType,
        minSqft: client.minSqft,
        maxSqft: client.maxSqft,
        maxMonthly: client.maxMonthly,
        transactionType: client.transactionType,
        maxSalePrice: client.maxSalePrice,
        geoBounds: client.geoBounds,
        sources: ['costar', 'crexi', 'loopnet'] as const,
      };

      const properties = await searchAllPlatforms(params);
      const { newProperties } = await diffProperties(client.id, properties);

      await saveSearchSnapshot(client.id, properties, newProperties);

      if (newProperties.length > 0 || shouldSendDigest(client)) {
        if (process.env.ENABLE_EMAIL === 'true' && process.env.DRY_RUN !== 'true') {
          await sendEmailAlert(client, properties, newProperties);
        }
        if (process.env.ENABLE_SMS === 'true' && process.env.DRY_RUN !== 'true' && newProperties.length > 0) {
          await sendSmsAlert(client, newProperties);
        }
      }

      // Throttle between clients
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`[Runner] Failed for client ${client.name}:`, err);
    }
  }
}

function shouldSendDigest(client: { searchFrequency: string }): boolean {
  const today = new Date().getDay(); // 0=Sunday
  if (client.searchFrequency === 'weekly' && today === 1) return true; // Monday
  return false;
}
