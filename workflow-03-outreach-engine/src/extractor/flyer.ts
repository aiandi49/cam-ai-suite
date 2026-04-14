import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface FlyerProfile {
  address: string;
  propertyType: string;
  sqft: number;
  price?: number;
  parking?: string;
  features: string[];
  targetTenantTypes: string[];
  matchSqftMin: number;
  matchSqftMax: number;
}

export async function extractFlyerProfile(filePath: string, mimeType: string): Promise<FlyerProfile> {
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString('base64');

  const msg = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png', data: base64 },
        },
        {
          type: 'text',
          text: `This is a commercial real estate listing flyer.
Extract the following and return ONLY valid JSON, no markdown:
{
  "address": "full street address",
  "propertyType": "retail|office|industrial|mixed|land",
  "sqft": number,
  "price": monthly_rent_number_or_null,
  "parking": "parking ratio string or null",
  "features": ["list", "of", "features"],
  "targetTenantTypes": ["retail", "restaurant", etc],
  "matchSqftMin": sqft * 0.7,
  "matchSqftMax": sqft * 1.4
}`,
        },
      ],
    }],
  });

  const text = (msg.content[0] as { text: string }).text;
  return JSON.parse(text) as FlyerProfile;
}
