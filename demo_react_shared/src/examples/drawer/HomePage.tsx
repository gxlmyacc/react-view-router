import React from 'react';
import type ReactViewRouter from 'react-view-router';
import RouterDrawer from 'react-view-router/drawer';
import type { RouterDrawerProps } from 'react-view-router/drawer';
import type { Translator } from '../../workspace/i18n';
import type { RecordDrawerEvent } from './context';
import './HomePage.scss?scoped';

interface HomePageProps {
  router: ReactViewRouter;
  t: Translator;
  record: RecordDrawerEvent;
}

type Dimension = 'width' | 'height' | 'maxWidth' | 'maxHeight';

interface HomePageState {
  note: string;
  position: NonNullable<RouterDrawerProps['position']>;
  dimensions: Record<Dimension, string>;
  applied: Partial<Record<Dimension, string | number>>;
  errors: Partial<Record<Dimension, boolean>>;
  mask: boolean;
  maskClosable: boolean;

}

export default class HomePage extends React.Component<HomePageProps, HomePageState> {

  state: HomePageState = {
    note: '', position: 'right', mask: true, maskClosable: false,
    dimensions: { width: '', height: '', maxWidth: '', maxHeight: '' }, applied: {}, errors: {},
  };

  componentDidMount(): void {
    this.props.record('mount');
  }

  // The child drawer covers this page; its instance and local state remain mounted.
  componentWillUnactivate(): void {
    this.props.record('unactivate');
  }

  // Closing the child route makes this same parent page active again.
  componentDidActivate(): void {
    this.props.record('activate');
  }

  updateDimension = (dimension: Dimension, value: string): void => {
    const text = value.trim();
    const parsed = /^\d+(\.\d+)?$/.test(text) ? Number(text) : text || undefined;
    const property = dimension.replace('max', 'max-').toLowerCase();
    const valid = !text || (typeof parsed === 'number'
      ? Number.isFinite(parsed) && parsed >= 0 : CSS.supports(property, text));
    this.setState(previous => ({
      dimensions: { ...previous.dimensions, [dimension]: value },
      errors: { ...previous.errors, [dimension]: !valid },
      applied: valid ? { ...previous.applied, [dimension]: parsed } : previous.applied,
    }));
  };

  render(): React.ReactElement {
    const { router, t } = this.props;
    const { note, position, dimensions, applied, errors, mask, maskClosable } = this.state;

    return (
      <article className="drawer-home-page">
        <h3>{t('drawerHomeTitle')}</h3>
        <p>{t('drawerHomeText')}</p>
        <label className="drawer-parent-note">
          {t('drawerParentNote')}
          <input value={note} onChange={event => this.setState({ note: event.target.value })} />
        </label>
        <div className="drawer-settings">
          <fieldset className="drawer-direction-group">
            <legend>{t('drawerPosition')}</legend>
            {(['top', 'bottom', 'left', 'right', 'center'] as const).map(direction => (
              <label key={direction}>
                <input type="radio" name="drawer-direction" value={direction} checked={position === direction}
                  onChange={() => this.setState({ position: direction })} />
                {t(`drawerDirection_${direction}`)}
              </label>
            ))}
          </fieldset>
          {(['width', 'height', 'maxWidth', 'maxHeight'] as const).map(dimension => {
            const label = t(({
              width: 'drawerWidth', height: 'drawerHeight',
              maxWidth: 'drawerMaxWidth', maxHeight: 'drawerMaxHeight'
            } as const)[dimension]);
            return <label key={dimension}>{label}
              <input type="text" aria-label={label} aria-invalid={errors[dimension] || undefined}
                value={dimensions[dimension]} placeholder={dimension.startsWith('max') ? t('drawerNoLimit') : '100%'}
                onChange={event => this.updateDimension(dimension, event.target.value)} />
              {errors[dimension] && <span role="alert">{t('drawerDimensionError')}</span>}
            </label>;
          })}
          <label>
            <input type="checkbox" checked={mask} onChange={event => this.setState({ mask: event.target.checked })} />
            {t('drawerMask')}
          </label>
          <label>
            <input type="checkbox" checked={maskClosable} disabled={!mask}
              onChange={event => this.setState({ maskClosable: event.target.checked })} />
            {t('drawerMaskClosable')}
          </label>
        </div>
        <p>{t('drawerBackdropHint')}</p>
        <p>{t('drawerDimensionHint')}</p>
        {position === 'center' && <p>{t('drawerCenterHint')}</p>}
        <button type="button" onClick={() => router.push('/home/details')}>
          {t('drawerOpenDetails')}
        </button>
        <RouterDrawer position={position} mask={mask} maskClosable={maskClosable}
          width={applied.width} height={applied.height} maxWidth={applied.maxWidth} maxHeight={applied.maxHeight} />
      </article>
    );
  }

}
