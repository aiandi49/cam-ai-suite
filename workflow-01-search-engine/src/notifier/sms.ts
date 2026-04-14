import twilio from 'twilio';
import { Client, Property } from '../../../shared/types/index';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSmsAlert(client: Client, newProperties: Property[]): Promise<void> {
  if (!client.phone) return;

  const count = newProperties.length;
  const body = count === 1
    ? `Hey ${client.name.split(' ')[0]}, 1 new space just hit your search. Check your email for details. — Cameron`
    : `Hey ${client.name.split(' ')[0]}, ${count} new spaces hit your search. Check your email. — Cameron`;

  await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER,
    to: client.phone,
  });

  console.log(`[SMS] Sent to ${client.phone}`);
}
