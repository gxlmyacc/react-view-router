require('@babel/polyfill');

const util = {};

function parseURL(url) {
  function removeQuery(str) {
    let i = str.indexOf('?');
    return i >= 0 ? str.substring(0, i) : str;
  }
  let a = document.createElement('a');
  a.href = url;
  let ret = {
    source: url,
    protocol: a.protocol.replace(':', ''),
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function () {
      let ret = {};
      let i = 0;
      let search = a.search;
      if (!search) {
        i = a.hash.indexOf('?');
        if (i >= 0) search = a.hash.substr(i);
      }
      let seg = search.replace(/^\?/, '').split('&');
      let len = seg.length;
      let s;
      for (i = 0; i < len; i++) {
        if (!seg[i]) continue;
        s = seg[i].split('=');
        ret[s[0]] = s[1] !== undefined ? s[1] : true;
      }
      return ret;
    })(),
    file: (a.pathname.match(/\/([^/?#]+)$/i) || [undefined, ''])[1],
    hash: removeQuery(a.hash.replace('#', '')),
    path: a.pathname.replace(/^([^/])/, '/$1'),
    relative: removeQuery((a.href.match(/tps?:\/\/[^/]+(.+)/) || [undefined, ''])[1]),
    segments: a.pathname.replace(/^\//, '').split('/')
  };
  return ret;
}

util.isSupport = (function () {
  let ret = true;
  if (navigator.appName == 'Microsoft Internet Explorer') {
    let trimVersion = navigator.appVersion.split(';')[1].replace(/[ ]/g, '');
    ret = !/^MSIE[5|6|7|8|9]\.0$/.test(trimVersion);
  }
  if (ret) util.rootUrl = parseURL(window.location.href);
  return ret;
})();

export default util;
