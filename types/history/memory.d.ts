import { State, History, To, PartialLocation, HistoryOptions } from './types';
/**
 * A memory history stores locations in memory. This is useful in stateful
 * environments where there is no web browser, such as node tests or React
 * Native.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#memoryhistory
 */
export interface MemoryHistory<S extends State = State> extends History<S> {
    length: number;
    index: number;
}
/**
 * A user-supplied object that describes a location. Used when providing
 * entries to `createMemoryHistory` via its `initialEntries` option.
 */
export declare type InitialEntry = string | PartialLocation;
export interface MemoryHistoryOptions extends HistoryOptions {
    initialEntries?: InitialEntry[];
    initialIndex?: number;
}
export declare function createMemoryHref(to: To): string;
/**
  * Memory history stores the current location in memory. It is designed for use
  * in stateful non-browser environments like tests and React Native.
  *
  * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#creatememoryhistory
  */
export declare function createMemoryHistory(options?: MemoryHistoryOptions): MemoryHistory;
