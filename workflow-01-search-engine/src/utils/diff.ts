import { Property } from '../../../shared/types/index';

/**
 * Compare today's results against yesterday's snapshot.
 * A property is "new" if its externalId+source combo wasn't in yesterday's results.
 */
export function diffPropertyLists(
  previous: Property[],
  current: Property[]
): { newProperties: Property[]; removedProperties: Property[] } {
  const prevKeys = new Set(previous.map(p => `${p.source}:${p.externalId}`));
  const currKeys = new Set(current.map(p => `${p.source}:${p.externalId}`));

  const newProperties = current.filter(p => !prevKeys.has(`${p.source}:${p.externalId}`));
  const removedProperties = previous.filter(p => !currKeys.has(`${p.source}:${p.externalId}`));

  return { newProperties, removedProperties };
}
