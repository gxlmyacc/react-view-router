import util from 'libs/util';

if (util.isSupport) {
  let VueRun = require('./views/entry');
  VueRun();
}

