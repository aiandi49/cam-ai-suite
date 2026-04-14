import Anthropic from '@anthropic-ai/sdk';
import { SearchParameters } from '../../../shared/types/index';
import { PropertyWithSummary } from './report';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAiSummaries(
  properties: PropertyWithSummary[],
  searchParams: SearchParameters
): Promise<PropertyWithSummary[]> {
  const results: PropertyWithSummary[] = [];

  for (const prop of properties) {
    try {
      const summary = await generateSummaryForProperty(prop, searchParams);
      results.push({ ...prop, aiSummary: summary });
    } catch {
      results.push({ ...prop, aiSummary: undefined });
    }
    // Rate limit: 500ms between calls
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

async function generateSummaryForProperty(
  prop: PropertyWithSummary,
  params: SearchParameters
): Promise<string> {
  const prompt = `You are a commercial real estate expert writing for a non-expert client.
In 2-3 sentences, describe this property in plain English.
Highlight the most important selling points. Be specific and honest. No jargon.
If the square footage can be split into smaller units, mention it.

Property:
- Address: ${prop.address}
- Type: ${prop.propertyType}
- Size: ${prop.sqft?.toLocaleString()} SF
- Asking: $${prop.askingMonthly?.toLocaleString()}/mo
- Built: ${prop.yearBuilt}
- Traffic: ${prop.trafficCount?.toLocaleString()} vehicles/day
- Parking: ${prop.parkingRatio} per 1,000 SF
- Sprinklered: ${prop.sprinklered ? 'Yes' : 'No'}
- Cross street: ${prop.crossStreet}

Client is looking for: ${params.propertyType}, ${params.minSqft?.toLocaleString()}–${params.maxSqft?.toLocaleString()} SF, max $${params.maxMonthly?.toLocaleString()}/mo`;

  const msg = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  return (msg.content[0] as { text: string }).text;
}
