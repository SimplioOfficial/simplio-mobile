export const makeURL =
  (baseURL: string) =>
  (...paths: string[]): URL => {
    const prefixedPaths = paths
      .map(p => (p.startsWith('/') ? p : `/${p}`))
      .map(p => (p.endsWith('/') ? p.slice(0, p.length - 1) : p));

    return new URL(prefixedPaths.join(''), baseURL);
  };
