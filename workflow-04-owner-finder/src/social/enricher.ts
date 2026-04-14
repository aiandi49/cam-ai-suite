import Anthropic from '@anthropic-ai/sdk';
import { Principal } from '../../../shared/types/index';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Use Claude AI with web search to find contact info for a person.
 * Given their name and company, find: email, phone, LinkedIn, other info.
 */
export async function enrichContact(
  name: string,
  company: string | undefined
): Promise<Partial<Principal>> {
  const prompt = `Find publicly available contact information for this person:
Name: ${name}
Company: ${company || 'Unknown'}
Location: Tucson, Arizona (likely)
Industry: Commercial real estate / property management / business owner

Search for and return:
- LinkedIn URL (if findable)
- Email address (if publicly listed)
- Phone number (if publicly listed)  
- Any other relevant professional info (education, other roles)

Return ONLY valid JSON:
{
  "linkedinUrl": "url or null",
  "email": "email or null",
  "phone": "phone or null",
  "notes": "brief relevant info"
}

Only include information that appears to be publicly available. Do not guess.`;

  try {
    const msg = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 300,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = msg.content.find(b => b.type === 'text');
    if (!textBlock) return {};

    const text = (textBlock as { text: string }).text;
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    return {
      linkedinUrl: json.linkedinUrl,
      email: json.email,
      phone: json.phone,
    };
  } catch {
    return {};
  }
}
