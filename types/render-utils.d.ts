import type { ReactRenderUtils, PartialReactRenderUtils } from './types';
/** Browser host operations that do not require ReactDOM. Globals are read only on invocation. */
declare const defaultRenderUtils: Omit<ReactRenderUtils, 'reactDOM'>;
export type KeepAliveRenderUtils = {
    reactDOM: Pick<ReactRenderUtils['reactDOM'], 'createPortal'>;
    document: Pick<ReactRenderUtils['document'], 'createElement' | 'createDocumentFragment'>;
    node: Pick<ReactRenderUtils['node'], 'appendChild' | 'insertBefore'>;
};
/** Validate only the host operations used by KeepAlive, including partial custom adapters. */
export declare function assertKeepAliveRenderUtils(utils: PartialReactRenderUtils<any> | undefined): asserts utils is KeepAliveRenderUtils;
export default defaultRenderUtils;
