import React, { useEffect, useState } from 'react';
import { useManualRouter, useRoute } from 'react-view-router';
import type { ManualRouterOptions } from 'react-view-router';
import TransitionRouterView from 'react-view-router/transition';
import type { TransitionName } from 'react-view-router/transition';
import router from './history';
import routes from './routes';
import { useDemoRuntime } from '../../workspace/context';
import './App.scss?scoped';

export interface RouteTransitionAppProps {
  basename: string;
  mode: NonNullable<ManualRouterOptions['mode']>;
}

const transitionNames: TransitionName[] = ['slide', 'slide-up', 'slide-down', 'fade', 'fade-slide', 'zoom', 'fade-through', 'carousel', 'none'];

export default function RouteTransitionApp({
  basename, mode,
}: RouteTransitionAppProps): React.ReactElement {
  const { t } = useDemoRuntime();
  const [transition, setTransition] = useState<TransitionName>('slide');
  const [duration, setDuration] = useState(600);
  const { start } = useManualRouter(router, {
    basename,
    mode,
    routes,
    manual: true,
  });
  const route = useRoute(router, { watch: true });

  useEffect(() => start(), [start]);

  const currentIndex = ['/first', '/second', '/third'].indexOf(route?.path || '');
  const openNext = (): void => {
    const nextIndex = Math.min(currentIndex + 1, 2);
    router.push(['/first', '/second', '/third'][nextIndex]);
  };

  return (
    <section className="route-transition-example">
      <div className="transition-controls">
        <div className="transition-types" role="group" aria-label={t('transitionType')}>
          {transitionNames.map(name => (
            <button
              className={name === transition ? 'is-active' : ''}
              type="button"
              key={name}
              onClick={() => setTransition(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="transition-actions">
          <button type="button" disabled={currentIndex <= 0} onClick={() => router.back()}>
            {t('transitionBack')}
          </button>
          <button type="button" disabled={currentIndex >= 2} onClick={openNext}>
            {t('transitionNext')}
          </button>
        </div>
      </div>
      <p className="transition-route">
        {t('moduleCurrentRoute')}: <code>{route?.fullPath || '—'}</code>
      </p>
      <label className="transition-speed">
        {t('transitionSpeed')}: <output>{duration} ms</output>
        <input
          type="range"
          min="150"
          max="1200"
          step="50"
          value={duration}
          onChange={event => setDuration(Number(event.target.value))}
        />
      </label>
      <div className="transition-viewport">
        <TransitionRouterView
          router={router}
          transition={transition}
          transitionDuration={duration}
          transitionFallback="fade"
          containerStyle={{ height: '100%' }}
        />
      </div>
    </section>
  );
}
