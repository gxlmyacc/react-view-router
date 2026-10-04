import React, { useEffect, useRef, useState } from 'react';
import {
  getGuardEvents,
  resetGuardEvents,
  subscribeGuardEvents,
} from '../guard-events';
import type { GuardEvent, GuardOutcome } from '../guard-events';
import { useDemoRuntime } from '../../../workspace/context';
import type { Translator } from '../../../workspace/i18n';
import './GuardLog.scss?scoped';

interface GuardEventGroup {
  navigationId: number;
  from: string;
  to: string;
  events: GuardEvent[];
}

interface NavigationResult {
  status: string;
  outcome: GuardOutcome;
  reason: string;
}

type OutcomeLabels = Record<GuardOutcome, string>;

function groupGuardEvents(events: GuardEvent[]): GuardEventGroup[] {
  return events.reduce<GuardEventGroup[]>((groups, event) => {
    let group = groups[groups.length - 1];
    if (!group || group.navigationId !== event.navigationId) {
      group = {
        navigationId: event.navigationId,
        from: event.from,
        to: event.to,
        events: [],
      };
      groups.push(group);
    }
    group.events.push(event);
    return groups;
  }, []);
}

function formatGuardName(event: GuardEvent): string {
  if (event.scope === 'router') return `router.${event.hook}`;
  return `${event.scope}:${event.owner}.${event.hook}`;
}

function getNavigationResult(
  group: GuardEventGroup,
  outcomeLabels: OutcomeLabels,
  t: Translator,
): NavigationResult {
  const decisiveEvent = group.events.find(event => event.outcome === 'abort' || event.outcome === 'redirect');
  if (decisiveEvent) {
    return {
      status: decisiveEvent.outcome === 'abort' ? t('blocked') : t('redirected'),
      outcome: decisiveEvent.outcome,
      reason: `${formatGuardName(decisiveEvent)} → ${outcomeLabels[decisiveEvent.outcome]}`,
    };
  }
  const completed = group.events.some(event => event.label === 'router:afterEach');
  return {
    status: completed ? t('entered') : t('checking'),
    outcome: completed ? 'completed' : 'observed',
    reason: completed ? '' : t('waiting'),
  };
}

export default function GuardLog(): React.ReactElement {
  const { t } = useDemoRuntime();
  const [events, setEvents] = useState(getGuardEvents);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const groups = groupGuardEvents(events);
  const outcomeLabels: OutcomeLabels = {
    continue: t('allow'),
    abort: t('block'),
    redirect: t('redirect'),
    completed: t('complete'),
    callback: t('callback'),
    observed: t('observe'),
  };

  useEffect(() => subscribeGuardEvents(setEvents), []);
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) scrollElement.scrollTop = scrollElement.scrollHeight;
  }, [events.length]);

  return (
    <aside className="guard-log">
      <div className="guard-log-heading">
        <strong>{t('guardLogTitle')}</strong>
        <button type="button" onClick={resetGuardEvents}>{t('clear')}</button>
      </div>
      <p className="guard-log-help">{t('guardLogHelp')}</p>
      <div className="guard-navigation-list" ref={scrollRef}>
        {groups.map((group) => {
          const result = getNavigationResult(group, outcomeLabels, t);
          return (
            <section className="guard-navigation" key={`${group.navigationId}-${group.events[0].sequence}`}>
              <header className="guard-navigation-heading">
                <strong>#{group.navigationId || 0}</strong>
                <div className="guard-log-route">
                  <code>{group.from}</code>
                  <span aria-hidden="true">→</span>
                  <code>{group.to}</code>
                </div>
                <span className={`guard-navigation-result is-${result.outcome}`}>{result.status}</span>
              </header>
              {result.reason ? <p className="guard-navigation-reason">{result.reason}</p> : null}
              <ol>
                {group.events.map((event, index) => (
                  <li key={`${event.sequence || index}-${event.label}`}>
                    <div className="guard-log-event">
                      <span className="guard-log-step">{index + 1}</span>
                      <code>{formatGuardName(event)}</code>
                      <strong className={`guard-log-outcome is-${event.outcome}`}>
                        {outcomeLabels[event.outcome] || event.outcome.toUpperCase()}
                      </strong>
                    </div>
                    {event.detail ? <small>{event.detail}</small> : null}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
