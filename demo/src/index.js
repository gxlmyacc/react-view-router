import util from 'libs/util';

if (util.isSupport) {
  let StartRun = require('./views/entry').default;
  StartRun();
}

