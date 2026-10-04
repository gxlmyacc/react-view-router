export default function getPathnameFromDeepLink(url, prefixes = []) {
  if (!url) return null;

  const matchedPrefix = prefixes.find((prefix) => url.indexOf(prefix) === 0);
  const schemeIndex = url.indexOf('://');
  const pathAndQuery = matchedPrefix
    ? url.slice(matchedPrefix.length)
    : (schemeIndex >= 0 ? url.slice(schemeIndex + 3) : url);
  const pathname = pathAndQuery.split('?')[0].replace(/^\/+/, '');
  return pathname ? `/${pathname}` : '/';
}
