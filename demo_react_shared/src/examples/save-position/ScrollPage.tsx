import React from 'react';
import { useDemoRuntime } from '../../workspace/context';
import './ScrollPage.scss?scoped';

export default function ScrollPage(): React.ReactElement {
  const { t } = useDemoRuntime();
  return (
    <div className="save-position-scroll" data-testid="position-list" tabIndex={0}>
      <ol>
        {Array.from({ length: 40 }, (_, index) => (
          <li key={index}>{t('positionItem')} {String(index + 1).padStart(2, '0')}</li>
        ))}
      </ol>
    </div>
  );
}
