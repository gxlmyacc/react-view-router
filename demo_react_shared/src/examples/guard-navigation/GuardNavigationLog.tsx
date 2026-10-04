import React, { useEffect, useRef, useState } from 'react';
import {
  getGuardNavigationEvents,
  subscribeGuardNavigationEvents,
} from './events';
import type { GuardNavigationEvent } from './events';
import { useDemoRuntime } from '../../workspace/context';

function groupEvents(events: GuardNavigationEvent[]): Array<{ id: number; events: GuardNavigationEvent[] }> {
  return events.reduce<Array<{ id: number; events: GuardNavigationEvent[] }>>((groups, event) => {
    let group = groups.find(item => item.id === event.id);
    if (!group) {
      group = { id: event.id, events: [] };
      groups.push(group);
    }
    group.events.push(event);
    return groups;
  }, []);
}

export default function GuardNavigationLog(): React.ReactElement {
  const { t } = useDemoRuntime();
  const [events, setEvents] = useState(getGuardNavigationEvents);
  const scrollRef = useRef<HTMLDivElement|null>(null);
  const groups = groupEvents(events);

  useEffect(() => subscribeGuardNavigationEvents(setEvents), []);
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [events.length]);

  return (
    <aside className="guard-takeover-log" ref={scrollRef}>
      {groups.length ? groups.map(group => (
        <section key={group.id}>
          <header>
            <strong>#{group.id}</strong>
            <code>{group.events[0].from} → {group.events[0].to}</code>
          </header>
          <ol>
            {group.events.map((event, index) => (
              <li key={`${event.hook}-${index}`}>
                <div>
                  <code>{event.hook}</code>
                  <strong className={`is-${event.outcome}`}>{event.outcome.toUpperCase()}</strong>
                </div>
                <small>{event.detail}</small>
              </li>
            ))}
          </ol>
        </section>
      )) : <p>{t('guardNavigationEmptyLog')}</p>}
    </aside>
  );
}
