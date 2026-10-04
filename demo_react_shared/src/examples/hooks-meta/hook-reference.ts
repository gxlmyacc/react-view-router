/* eslint-disable max-len -- reference prose remains easier to maintain beside its translation */
import type { Locale } from '../../workspace/i18n';

interface LocalizedText {
  en: string;
  zh: string;
}

export interface HookParameter {
  name: string;
  type: string;
  description: LocalizedText;
}

export interface HookReference {
  name: string;
  path: string;
  signature: string;
  summary: LocalizedText;
  parameters: HookParameter[];
  returns: LocalizedText;
  tab?: boolean;
}

export interface HookGroup {
  path: string;
  title: string;
  hooks: HookReference[];
}

const text = (en: string, zh: string): LocalizedText => ({ en, zh });
const parameter = (name: string, type: string, en: string, zh: string): HookParameter => ({
  name,
  type,
  description: text(en, zh),
});

export const hookGroups: HookGroup[] = [
  {
    path: 'context',
    title: 'hooksContextGroup',
    hooks: [
      {
        name: 'useRouter', path: 'use-router', signature: 'useRouter(defaultRouter?)', tab: true,
        summary: text('Gets the explicitly supplied router or the nearest RouterContext router.', '获取显式传入的 Router，或最近 RouterContext 中的 Router。'),
        parameters: [parameter('defaultRouter', 'ReactViewRouter | null', 'Optional router used before Context lookup.', '可选的 Router；提供后优先于 Context。')],
        returns: text('ReactViewRouter | null', 'ReactViewRouter | null'),
      },
      {
        name: 'useManualRouter', path: 'use-manual-router', signature: 'useManualRouter(router, options?)',
        summary: text('Starts and stops a module-owned router with the component lifecycle.', '让模块自有 Router 跟随组件生命周期启动和停止。'),
        parameters: [
          parameter('router', 'ReactViewRouter', 'The stable router instance owned by the module.', '模块持有的稳定 Router 实例。'),
          parameter('options', 'ManualRouterOptions', 'basename, pathname, history/mode, routes, hashType and manual startup behavior.', '配置 basename、pathname、history/mode、routes、hashType 及手动启动行为。'),
        ],
        returns: text('{ router, start(overrideOptions?) }', '{ router, start(overrideOptions?) }'),
      },
      {
        name: 'useRouterView', path: 'use-router-view', signature: 'useRouterView()',
        summary: text('Gets the nearest RouterView instance for view-level integration.', '获取最近的 RouterView 实例，用于视图级集成。'),
        parameters: [],
        returns: text('RouterView instance or null', 'RouterView 实例或 null'),
      },
    ],
  },
  {
    path: 'route',
    title: 'hooksRouteGroup',
    hooks: [
      {
        name: 'useRoute', path: 'use-route', signature: 'useRoute(defaultRouter?, options?)', tab: true,
        summary: text('Reads the current Route and can re-render when navigation completes.', '读取 currentRoute，并可在导航完成时触发重新渲染。'),
        parameters: [
          parameter('defaultRouter', 'ReactViewRouter | null', 'Optional router; otherwise uses Context.', '可选 Router；未提供时读取 Context。'),
          parameter('options', 'UseRouteOptions', 'watch, delay and ignoreSamePath control update subscription.', '通过 watch、delay、ignoreSamePath 控制更新订阅。'),
        ],
        returns: text('Route | null', 'Route | null'),
      },
      {
        name: 'useMatchedRoute', path: 'use-matched-route', signature: 'useMatchedRoute(defaultRouter?, options?)',
        summary: text('Reads the MatchedRoute at the current RouterView depth.', '读取当前 RouterView 深度对应的 MatchedRoute。'),
        parameters: [
          parameter('defaultRouter', 'ReactViewRouter | null', 'Optional router.', '可选 Router。'),
          parameter('options', 'UseMatchedRouteOptions', 'Supports watch options, matchedOffset and commonPageName.', '支持 watch 配置、matchedOffset 和 commonPageName。'),
        ],
        returns: text('MatchedRoute | null', 'MatchedRoute | null'),
      },
      {
        name: 'useMatchedRouteAndIndex', path: 'use-matched-route-and-index', signature: 'useMatchedRouteAndIndex(defaultRouter?, options?)',
        summary: text('Returns the matched route together with its resolved depth index.', '同时返回匹配路由及其最终层级索引。'),
        parameters: [parameter('options.matchedOffset', 'number', 'Offsets the depth relative to the nearest RouterView.', '相对最近 RouterView 的层级偏移量。')],
        returns: text('[MatchedRoute | null, number]', '[MatchedRoute | null, number]'),
      },
      {
        name: 'useMatchedRouteIndex', path: 'use-matched-route-index', signature: 'useMatchedRouteIndex(matchedOffset?)',
        summary: text('Calculates the matched-route index from the nearest RouterView depth.', '根据最近 RouterView 的深度计算 matched 索引。'),
        parameters: [parameter('matchedOffset', 'number = 0', 'Adds an offset to the current view depth.', '在当前视图深度上增加偏移。')],
        returns: text('number', 'number'),
      },
    ],
  },
  {
    path: 'data',
    title: 'hooksDataGroup',
    hooks: [
      {
        name: 'useRouteParams', path: 'use-route-params', signature: 'useRouteParams(defaultRouter?, options?)', tab: true,
        summary: text('Reads dynamic path parameters from the matched route.', '读取匹配路由中的动态路径参数。'),
        parameters: [parameter('options', 'UseMatchedRouteOptions', 'Selects depth and optional route-change watching.', '选择匹配层级并配置路由变化监听。')],
        returns: text('Record<string, unknown>', '路由 params 对象'),
      },
      {
        name: 'useRouteQuery', path: 'use-route-query', signature: 'useRouteQuery(defaultRouter?, options?)',
        summary: text('Reads parsed query values from the current Route.', '读取当前 Route 已解析的 query。'),
        parameters: [parameter('options', 'UseRouteOptions', 'Controls whether and when query changes re-render the component.', '控制 query 变化是否以及何时触发重新渲染。')],
        returns: text('Record<string, unknown>', '路由 query 对象'),
      },
      {
        name: 'useRouteState', path: 'use-route-state', signature: 'useRouteState(defaultRouter?, initialState?, options?)',
        summary: text('Reads and replaces state attached to the current matched history entry.', '读取并替换当前匹配 history entry 上的 state。'),
        parameters: [
          parameter('initialState', 'object | (() => object)', 'Fallback used when the route entry has no state.', '当前 entry 没有 state 时使用的初始值。'),
          parameter('options', 'UseMatchedRouteOptions', 'Selects the matched level and watch behavior.', '选择匹配层级和监听行为。'),
        ],
        returns: text('[state, setRouteState]', '[state, setRouteState]'),
      },
      {
        name: 'useRouteMeta', path: 'use-route-meta', signature: 'useRouteMeta(metaKey, defaultRouter?, options?)', tab: true,
        summary: text('Reads selected route metadata and returns an updater for those keys.', '读取指定路由元信息，并返回这些字段的更新方法。'),
        parameters: [
          parameter('metaKey', 'string | string[]', 'One key or an allow-list of metadata keys.', '一个 meta 字段，或允许读写的字段列表。'),
          parameter('options.ignoreConfigRoute', 'boolean', 'Avoids updating the source ConfigRoute metadata.', '更新时不写回源 ConfigRoute 的 meta。'),
        ],
        returns: text('[value, setValue(newValue, setAll?)]', '[value, setValue(newValue, setAll?)]'),
      },
    ],
  },
  {
    path: 'events',
    title: 'hooksEventsGroup',
    hooks: [
      {
        name: 'useRouteChanged', path: 'use-route-changed', signature: 'useRouteChanged(router, onChange, deps?)',
        summary: text('Registers an onRouteChange plugin callback for the component lifetime.', '在组件生命周期内注册 onRouteChange 插件回调。'),
        parameters: [parameter('onChange', 'onRouteChangeEvent', 'Receives current route, previous route and router.', '接收当前路由、上一条路由和 Router。'), parameter('deps', 'string[]', 'Extra effect dependencies.', '额外的 Effect 依赖。')],
        returns: text('void', 'void'),
      },
      {
        name: 'useRouteMetaChanged', path: 'use-route-meta-changed', signature: 'useRouteMetaChanged(router, onChange, deps?)',
        summary: text('Subscribes to route metadata changes and can filter changed keys.', '订阅路由元信息变化，并可按字段过滤。'),
        parameters: [parameter('deps', 'string[]', 'When non-empty, only matching changed metadata keys trigger onChange.', '非空时，仅指定 meta 字段变化会触发回调。')],
        returns: text('void', 'void'),
      },
      {
        name: 'useRouterViewEvent', path: 'use-router-view-event', signature: 'useRouterViewEvent(name, onEvent, unshift?)',
        summary: text('Subscribes to an event emitted by the nearest RouterView.', '订阅最近 RouterView 发出的视图事件。'),
        parameters: [parameter('name', 'keyof RouterViewEvents', 'RouterView event name.', 'RouterView 事件名。'), parameter('unshift', 'boolean', 'Registers the handler at the beginning of the event list.', '将处理函数注册到事件列表头部。')],
        returns: text('void', 'void'),
      },
      {
        name: 'useViewActivate', path: 'use-view-activate', signature: 'useViewActivate(callback)',
        summary: text('Runs a callback when a kept-alive route view activates.', '在 keep-alive 路由视图激活时执行回调。'),
        parameters: [parameter('callback', 'RouterView activate callback', 'Receives the view activation event.', '接收视图激活事件。')],
        returns: text('void', 'void'),
      },
      {
        name: 'useViewDeactivate', path: 'use-view-deactivate', signature: 'useViewDeactivate(callback)',
        summary: text('Runs a callback when a kept-alive route view deactivates.', '在 keep-alive 路由视图失活时执行回调。'),
        parameters: [parameter('callback', 'RouterView lifecycle callback', 'Receives the view lifecycle event.', '接收视图生命周期事件。')],
        returns: text('void', 'void'),
      },
      {
        name: 'useRouteGuardsRef', path: 'use-route-guards-ref', signature: 'useRouteGuardsRef(ref, guards, deps?)',
        summary: text('Exposes function-component route guards through an imperative ref.', '通过命令式 ref 暴露函数组件的路由守卫。'),
        parameters: [parameter('guards', 'RouteGuardsInfo | (() => RouteGuardsInfo)', 'Guard object or factory.', '路由守卫对象或创建函数。'), parameter('deps', 'DependencyList', 'Dependencies used to rebuild the imperative handle.', '重新生成命令式 handle 的依赖。')],
        returns: text('void', 'void'),
      },
    ],
  },
  {
    path: 'navigation',
    title: 'hooksNavigationGroup',
    hooks: [
      {
        name: 'useRouteTitle', path: 'use-route-title', signature: 'useRouteTitle(props?, defaultRouter?, deps?)', tab: true,
        summary: text('Builds menu, tab and breadcrumb models from route metadata and the current matched chain.', '从路由元信息和当前匹配链生成菜单、标签页及面包屑模型。'),
        parameters: [
          parameter('props.maxLevel', 'number = 99', 'Maximum number of title levels to collect.', '最多收集多少层 title。'),
          parameter('props.filter', 'filterCallback', 'Custom predicate for each candidate route.', '对每个候选路由执行自定义过滤。'),
          parameter('props.filterMetas', 'string[]', 'Metadata keys whose changes refresh titles.', '这些 meta 字段变化时重新生成 titles。'),
          parameter('props.manual', 'boolean', 'Starts with an empty title list until refreshTitles is called.', '初始不扫描路由，直到调用 refreshTitles。'),
          parameter('props.matchedOffset', 'number = 0', 'Moves the menu root relative to the current RouterView depth.', '相对当前 RouterView 深度移动菜单根层级。'),
          parameter('props.commonPageName', 'string = "commonPage"', 'Metadata key used to restore the redirected page menu on shared pages.', '公共页面根据 redirect 恢复来源菜单时使用的 meta 字段名。'),
          parameter('props.titleName', 'string = "title"', 'Metadata field used as the displayed title.', '作为显示标题读取的 meta 字段名。'),
          parameter('props.onNoMatchedPath', '":first" | string | callback', 'Fallback behavior when the current route is absent from the generated model.', '当前路由不在生成模型中时的回退行为。'),
          parameter('defaultRouter', 'ReactViewRouter', 'Explicit router; useful outside a route component Context.', '显式 Router，适用于路由组件 Context 外部。'),
          parameter('deps', 'DependencyList', 'Additional dependencies that rebuild the title model.', '触发标题模型重建的额外依赖。'),
        ],
        returns: text('{ titles, setTitles, refreshTitles, matchedRoutes, matchedTitles, currentPaths, parsed }', '{ titles, setTitles, refreshTitles, matchedRoutes, matchedTitles, currentPaths, parsed }'),
      },
    ],
  },
];

export const hookReferences = hookGroups.reduce<Record<string, HookReference>>((result, group) => {
  group.hooks.forEach((hook) => { result[hook.name] = hook; });
  return result;
}, {});

export function localize(value: LocalizedText, locale: Locale): string {
  return value[locale];
}
