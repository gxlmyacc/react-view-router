export type NavigationCancelListener = (reason?: unknown) => void;
/** Platform-neutral cancellation contract for Chrome 49 and React Native. */
export interface NavigationSignal {
    readonly cancelled: boolean;
    readonly reason?: unknown;
    onCancel(listener: NavigationCancelListener): () => void;
}
export declare class NavigationSignalController {
    readonly signal: NavigationSignal;
    private mutableSignal;
    constructor();
    cancel(reason?: unknown): void;
}
