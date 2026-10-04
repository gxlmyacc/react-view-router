import React, { useEffect, useRef, useState } from 'react';
import { RouterView, useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import TransitionRouterView from 'react-view-router/transition';
import { useDemoRuntime } from '../../workspace/context';
import router from './history';
import routes from './routes';
import './App.scss?scoped';

interface SavePositionAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

export default function SavePositionApp({ basename, mode }: SavePositionAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const container = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [offset, setOffset] = useState(0);
  const route = useRoute(router, { watch: true });
  const { start } = useManualRouter(router, { basename, mode, routes, manual: true });
  useEffect(() => {
    router.updateRouteMeta(routes[1], { savePosition: '.save-position-scroll' });
    return start();
  }, [start]);
  useEffect(() => {
    if (route?.path === '/list') setOffset(container.current?.querySelector('.save-position-scroll')?.scrollTop || 0);
  }, [route?.path, animate]);

  const changeEnabled = (value: boolean): void => {
    setEnabled(value);
    const list = router.currentRoute?.matched[0];
    if (list) router.updateRouteMeta(list, { savePosition: value ? '.save-position-scroll' : false });
  };

  return (
    <section className="position-example">
      <p>{t('positionInstructions')}</p>
      <div className="position-controls">
        <label>
          <input type="checkbox" checked={enabled} disabled={route?.path !== '/list'}
            onChange={event => changeEnabled(event.target.checked)} />
          {t('positionEnabled')}
        </label>
        <label>
          <input type="checkbox" checked={animate} disabled={route?.path !== '/list'}
            onChange={event => setAnimate(event.target.checked)} />
          {t('positionAnimate')}
        </label>
        <button type="button" disabled={route?.path !== '/list'} onClick={() => router.push('/preview')}>
          {t('positionLeave')}
        </button>
        <span>{t('positionOffset')}: <output data-testid="position-offset">{Math.round(offset)} px</output></span>
      </div>
      <div className="position-view" ref={container} onScrollCapture={event => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('save-position-scroll')) setOffset(target.scrollTop);
      }}>
        {animate ? (
          // Transition supplies its content container. The selector locates the inner scroll area.
          <TransitionRouterView router={router} transition="slide" containerStyle={{ height: '100%' }} />
        ) : (
          // Plain RouterView needs the application-owned container getter.
          <RouterView router={router} getContainerRef={() => container.current} />
        )}
      </div>
      <pre><code>{animate
        ? '<TransitionRouterView router={router} transition="slide" />'
        : '<RouterView router={router} getContainerRef={() => container.current} />'}
      {'\nmeta: { savePosition: ".save-position-scroll" }\nnew ReactViewRouter({ routes, renderUtils })'}</code></pre>
      <p>{t('positionAdapterHelp')}</p>
    </section>
  );
}
