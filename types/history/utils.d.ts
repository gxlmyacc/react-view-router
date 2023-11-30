import { PartialPath, To, HashType, Blocker, State, Action, Location } from './types';
export declare const CAN_USE_DOM: boolean;
export declare const freeze: <T extends unknown>(obj: T) => T;
export declare function getPossibleHashType(_window?: Window, hash?: string): "slash" | "noslash";
export declare function clamp(n: number, lowerBound: number, upperBound: number): number;
export type Events<F> = {
    length: number;
    push: (fn: F) => () => void;
    call: (arg: any, payload?: any) => void;
};
export declare function createEvents<F extends Function>(): Events<F>;
export declare function createKey(): string;
export declare function getBaseHref(): string;
/**
 * Creates a string URL path from the given pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createpath
 */
export declare function createPath({ pathname, search, hash }: PartialPath): string;
/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#parsepath
 */
export declare function parsePath(path: string): PartialPath;
export declare function createHref(to: To, hashType?: HashType, _window?: any): string;
export declare function allowTx(blockers: Events<Blocker<State>>, action: Action, location: Location, index: number, nextIndex: number, cb: ((ok: boolean, payload?: any) => void) | null): boolean;
export declare function readonly<T extends object>(obj: T, key: string, get: () => any, options?: PropertyDescriptor): T;
