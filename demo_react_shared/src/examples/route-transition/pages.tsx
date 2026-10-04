import React from 'react';
import { useRoute } from 'react-view-router';
import router from './history';
import './pages.scss?scoped';

interface TransitionPageProps {
  index: number;
  title: string;
  color: string;
}

export default function TransitionPage({
  index, title, color,
}: TransitionPageProps): React.ReactElement {
  const route = useRoute(router, { watch: true });
  return (
    <article className="transition-page" style={{ background: color }}>
      <span className="transition-page-index">0{index}</span>
      <h3>{title}</h3>
      <p><code>{route?.fullPath}</code></p>
    </article>
  );
}
