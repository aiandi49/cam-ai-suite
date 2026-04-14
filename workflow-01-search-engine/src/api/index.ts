/**
 * Unified search — queries all 3 platforms in parallel, deduplicates
 */
import { SearchParameters, Property } from '../../../shared/types/index';
import { searchProperties as costarSearch } from './costar';
import { searchProperties as crexiSearch } from './crexi';
import { searchProperties as loopnetSearch } from './loopnet';
import { deduplicateProperties } from '../utils/dedup';

export async function searchAllPlatforms(params: SearchParameters): Promise<Property[]> {
  const sources: Promise<Property[]>[] = [];

  if (process.env.ENABLE_COSTAR === 'true') sources.push(costarSearch(params).catch(() => []));
  if (process.env.ENABLE_CREXI === 'true')   sources.push(crexiSearch(params).catch(() => []));
  if (process.env.ENABLE_LOOPNET === 'true') sources.push(loopnetSearch(params).catch(() => []));

  const results = await Promise.all(sources);
  const merged = results.flat();
  return deduplicateProperties(merged);
}
