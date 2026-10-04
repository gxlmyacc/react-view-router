import type { NavigationLoopProtectionOptions, NavigationLoopError } from './types';
/** Counts navigation attempts, including redirects that never commit a page. */
export default class NavigationLoopProtection {
    private visits;
    private options;
    configure(options?: false | NavigationLoopProtectionOptions): void;
    clear(): void;
    check(pathname: string): NavigationLoopError | undefined;
}
