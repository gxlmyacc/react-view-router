import type ReactViewRouter from './router';
import type { Route, RouteSavedPosition, PartialReactRenderUtils } from './types';
import type { RouterViewProps } from './router-view';
import { warn } from './util';

export const SAVED_POSITION_KEY = '_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_';
type Positions = Record<string, Record<string, RouteSavedPosition>>;
const caches = new WeakMap<ReactViewRouter, Positions>();

/** Position records belong to a router even when session storage is unavailable. */
function getPositions(router: ReactViewRouter): Positions {
  let positions = caches.get(router);
  if (!positions) {
    try {
      const value = router.options.renderUtils?.storage?.getSessionStorage?.()?.getItem(SAVED_POSITION_KEY);
      const parsed = value ? JSON.parse(value) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) positions = parsed;
    } catch (_) { /* unavailable storage */ }
    positions = positions || {};
    caches.set(router, positions);
  }
  return positions;
}

export interface PositionNavigation {
  to: Route;
  from: Route | null;
}

/** Owns navigation position state without accessing host elements. */
export default class ViewPosition {

  private warnings = new Set<string>();

  private warning(reason: string) {
    if (this.warnings.has(reason)) return;
    this.warnings.add(reason);
    warn(`[RouterView] savePosition skipped: ${reason}.`);
  }

  private container(props: RouterViewProps<any>, utils: PartialReactRenderUtils<any> | undefined): any {
    const getter = props.getContainerRef || utils?.position?.getDefaultPositionContainer;
    if (!getter) {
      this.warning('getContainerRef is missing and renderUtils.position.getDefaultPositionContainer is missing'); return null;
    }
    const container = getter();
    if (container == null) this.warning('getContainerRef returned no container');
    return container;
  }

  private target(
    container: any,
    setting: any,
    utils: PartialReactRenderUtils<any> | undefined,
    navigation: PositionNavigation,
    type: 'enter' | 'leave'
  ): any {
    if (typeof setting === 'function') return setting(container, { ...navigation, type });
    if (typeof setting === 'string') {
      if (!utils?.position?.queryPositionTarget) { this.warning('renderUtils.position.queryPositionTarget is missing'); return null; }
      return utils.position!.queryPositionTarget(container, setting) || container;
    }
    return container;
  }

  private records(router: ReactViewRouter, name: string, depth: number) {
    const positions = getPositions(router);
    const key = `${router.basenameNoSlash}_${name}_${depth}`;
    const existing = positions[key];
    const records = existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : (positions[key] = {});
    return { positions, records };
  }

  private persist(router: ReactViewRouter, positions: Positions) {
    try {
      router.options.renderUtils?.storage?.getSessionStorage?.()?.setItem(SAVED_POSITION_KEY, JSON.stringify(positions));
    } catch (_) { /* keep the router cache */ }
  }

  save(router: ReactViewRouter, props: RouterViewProps<any>, name: string, depth: number, navigation: PositionNavigation) {
    const { to, from } = navigation;
    if (!(to.action === 'PUSH' || to.params.isPush || to.query.isPush)) return;
    const setting = from?.metaComputed.savePosition;
    if (!setting && !props.onSavePosition) return;
    const utils = router.options.renderUtils;
    const container = this.container(props, utils);
    if (container == null) return;
    let position: RouteSavedPosition | null | undefined;
    if (setting) {
      const target = this.target(container, setting, utils, navigation, 'leave');
      if (target == null) return;
      if (!utils?.position?.getPosition) { this.warning('renderUtils.position.getPosition is missing'); return; }
      position = utils.position!.getPosition(target);
    } else position = props.onSavePosition!(container, navigation);
    if (!position || !Number.isFinite(position.x ?? 0) || !Number.isFinite(position.y ?? 0)) return;
    const { positions, records } = this.records(router, name, depth);
    records[`[${router.basenameNoSlash}]${from ? from.path : '-'}`] = { ...position };
    this.persist(router, positions);
  }

  restore(router: ReactViewRouter, props: RouterViewProps<any>, name: string, depth: number, navigation: PositionNavigation) {
    const { to } = navigation;
    if (!(to.action === 'POP' || to.params.isBack || to.params.isPop || to.query.back)) return;
    const { positions, records } = this.records(router, name, depth);
    const key = `[${router.basenameNoSlash}]${to.path}`;
    const position = records[key];
    if (!position) return;
    const utils = router.options.renderUtils;
    const setting = to.metaComputed.savePosition;
    const container = this.container(props, utils);
    if (container == null) return;
    if (props.onScrollToPosition) props.onScrollToPosition(container, position);
    else {
      const target = this.target(container, setting, utils, navigation, 'enter');
      if (target == null) return;
      if (!utils?.position?.setPosition) { this.warning('renderUtils.position.setPosition is missing'); return; }
      utils.position!.setPosition(target, position);
    }
    delete records[key];
    this.persist(router, positions);
  }

}
