import Anthropic from '@anthropic-ai/sdk';
import { ParcelRecord } from '../parcels/pima-parcels';
import { BuyerProfile } from '../matcher/engine';
import { Principal } from '../../../shared/types/index';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Draft a personalized pitch email to a property owner.
 * "I have a buyer who's looking for exactly this type of property."
 */
export async function draftPitchEmail(
  parcel: ParcelRecord,
  owner: Principal,
  buyerProfile: BuyerProfile
): Promise<string> {
  const firstName = owner.name.split(' ')[0];

  const prompt = `You are Cameron Norwood, a commercial real estate broker in Tucson, AZ.
Write a SHORT, genuine email (under 120 words) to ${firstName} about their property.

Property: ${parcel.address}
Owner: ${owner.name}

Situation:
- You have a buyer actively looking for ${buyerProfile.propertyType} space
- They need ${buyerProfile.minSqft.toLocaleString()}–${buyerProfile.maxSqft.toLocaleString()} SF
- Their budget is around $${buyerProfile.maxSalePrice?.toLocaleString() || 'negotiable'}
- This property is NOT currently listed — you found it through property records

Rules:
- Don't say "I found you through public records" — just say you came across the property
- Be direct but respectful — you're doing them a favor
- Mention the buyer has specific needs and their property fits
- Include [CALENDAR_LINK] placeholder
- No subject line. Body only.
- Sign as Cameron Norwood, phone number [PHONE]`;

  const msg = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return (msg.content[0] as { text: string }).text
    .replace('[CALENDAR_LINK]', process.env.CALENDAR_LINK || '')
    .replace('[PHONE]', process.env.BROKER_PHONE || '');
}
