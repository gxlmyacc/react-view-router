import type { NavigationLoopProtectionOptions, NavigationLoopError } from './types';

/** Counts navigation attempts, including redirects that never commit a page. */
export default class NavigationLoopProtection {

  private visits: { pathname: string; time: number }[] = [];

  private options: Required<NavigationLoopProtectionOptions> | false = false;

  configure(options?: false | NavigationLoopProtectionOptions) {
    if (options === false) {
      this.options = false;
    } else {
      const { windowMs = 1000, maxVisits = 10 } = options || {};
      if (typeof windowMs !== 'number' || !isFinite(windowMs) || windowMs <= 0
        || typeof maxVisits !== 'number' || !isFinite(maxVisits)
        || maxVisits <= 0 || Math.floor(maxVisits) !== maxVisits) {
        throw new Error('navigationLoopProtection requires a positive finite windowMs and a positive integer maxVisits');
      }
      this.options = { windowMs, maxVisits };
    }
    this.clear();
  }

  clear() {
    this.visits = [];
  }

  check(pathname: string): NavigationLoopError | undefined {
    if (!this.options || !pathname) return undefined;
    const { windowMs, maxVisits } = this.options;
    const now = Date.now();
    this.visits = this.visits.filter((visit) => now - visit.time < windowMs);
    this.visits.push({ pathname, time: now });
    if (this.visits.filter((visit) => visit.pathname === pathname).length < maxVisits) return undefined;

    // Clear before notifying business code so the next navigation can start immediately.
    this.clear();
    return Object.assign(new Error(`Navigation loop detected: stopping redirects at ${pathname} after ${maxVisits} attempts within ${windowMs}ms`), {
      code: 'NAVIGATION_LOOP_DETECTED' as const, pathname, windowMs, maxVisits,
    });
  }

}
