import { walkConfigRoutes } from 'react-view-router';
import type { ConfigRoute } from 'react-view-router';
import routes from './routes';

export type SiteSection = 'overview'|'guides'|'examples';

export interface SiteNavigationMeta {
  section: SiteSection;
  order: number;
  topNav?: boolean;
  navTitle?: string;
  tab?: boolean;
  closable?: boolean;
}

export interface SiteExampleMeta {
  description: string;
  scenarios: string[];
  apis: string[];
  source: string;
}

export interface SiteRouteEntry {
  path: string;
  title: string;
  navigation: SiteNavigationMeta;
  example?: SiteExampleMeta;
  route: ConfigRoute;
}

export function collectSiteRouteEntries(): SiteRouteEntry[] {
  const entries: SiteRouteEntry[] = [];
  walkConfigRoutes(routes, route => {
    const navigation = route.meta.site as SiteNavigationMeta|undefined;
    const title = route.meta.title;
    if (!navigation || typeof title !== 'string') return;
    entries.push({
      path: route.path,
      title,
      navigation,
      example: route.meta.example as unknown as SiteExampleMeta|undefined,
      route,
    });
  });
  return entries.sort((left, right) => left.navigation.order - right.navigation.order);
}

export const siteRouteEntries = collectSiteRouteEntries();

export function findSiteRouteEntry(path?: string): SiteRouteEntry|undefined {
  if (!path) return undefined;
  return siteRouteEntries.find(entry => entry.path === path);
}
