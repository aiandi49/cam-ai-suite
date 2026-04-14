import Anthropic from '@anthropic-ai/sdk';
import { ScoredLead } from '../leads/scorer';
import { FlyerProfile } from '../extractor/flyer';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function draftOutreachEmail(
  lead: ScoredLead,
  listing: FlyerProfile,
  contactName: string,
  companyName: string
): Promise<string> {
  const firstName = contactName.split(' ')[0];

  const prompt = `You are Cameron Norwood, a commercial real estate broker in Tucson, AZ.
Write a SHORT, genuine outreach email (under 100 words) to ${firstName} at ${companyName}.

Context:
- They leased ${lead.record.sqft.toLocaleString()} SF at ${lead.record.address} in ${lead.record.leaseDate.getFullYear()}
- Their lease likely expires around ${lead.estimatedLeaseExpiry.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
- You have a ${listing.propertyType} space at ${listing.address} (${listing.sqft.toLocaleString()} SF)

Rules:
- Conversational, not salesy
- Reference their actual lease situation naturally
- Mention you have a space that might be relevant
- Include [CALENDAR_LINK] as a placeholder for your calendar
- Sign off as Cameron
- No subject line — body only`;

  const msg = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return (msg.content[0] as { text: string }).text
    .replace('[CALENDAR_LINK]', process.env.CALENDAR_LINK || 'your calendar link');
}
