import { PartialPath, To, HashType, Blocker, State, Action, Location } from './types';
declare const CAN_USE_DOM: boolean;
declare const freeze: <T extends unknown>(obj: T) => T;
declare function getPossibleHashType(_window?: Window, hash?: string): "slash" | "noslash";
declare function clamp(n: number, lowerBound: number, upperBound: number): number;
type Events<F> = {
    length: number;
    push: (fn: F) => () => void;
    call: (arg: any, payload?: any) => void;
};
declare function createEvents<F extends Function>(): Events<F>;
declare function createKey(): string;
declare function getBaseHref(): string;
/**
 * Creates a string URL path from the given pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createpath
 */
declare function createPath({ pathname, search, hash, }: PartialPath): string;
/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#parsepath
 */
declare function parsePath(path: string): PartialPath;
declare function createHref(to: To, hashType?: HashType, _window?: any): string;
declare function allowTxWithParams(blockers: Events<Blocker<State>>, params: {
    action: Action;
    location: Location;
    index: number;
    nextIndex: number;
    callback: ((ok: boolean, payload?: any) => void) | null;
}): boolean;
declare function allowTx(blockers: Events<Blocker<State>>, action: Action, location: Location, index: number, nextIndex: number, callback: ((ok: boolean, payload?: any) => void) | null): boolean;
declare function readonly<T extends object>(obj: T, key: string, get: () => any, options?: PropertyDescriptor): T;
declare function hasOwnProp(obj: any, key: PropertyKey): boolean;
declare function copyOwnProperty(target: any, key: string, source: any): PropertyDescriptor | undefined;
declare function copyOwnProperties<T extends Record<string, any>, S extends Record<string, any>>(target: T | null, source: S | null, overwrite?: boolean): T & S;
export type { Events };
export { CAN_USE_DOM, freeze, getPossibleHashType, clamp, createEvents, createKey, getBaseHref, createPath, parsePath, createHref, allowTxWithParams, allowTx, readonly, hasOwnProp, copyOwnProperty, copyOwnProperties, };
