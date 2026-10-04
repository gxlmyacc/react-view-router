import ReactDOM from 'react-dom';
import type { ReactRenderUtils } from '../..';
import { defaultRenderUtils } from '../..';

const renderUtils: ReactRenderUtils = {
  ...defaultRenderUtils,
  reactDOM: {
    createPortal: ReactDOM.createPortal,
    findDOMNode: ReactDOM.findDOMNode,
    unmountComponentAtNode: ReactDOM.unmountComponentAtNode,
  },
};

export default renderUtils;
