import cron from 'node-cron';
import { runAllClientSearches } from './runner';

export function startScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '0 4 * * *';
  const tz = process.env.CRON_TIMEZONE || 'America/Phoenix';

  console.log(`[Scheduler] Starting — schedule: ${schedule} (${tz})`);

  cron.schedule(schedule, async () => {
    console.log(`[Scheduler] Running all client searches — ${new Date().toISOString()}`);
    try {
      await runAllClientSearches();
    } catch (err) {
      console.error('[Scheduler] Error during run:', err);
    }
  }, { timezone: tz });
}
