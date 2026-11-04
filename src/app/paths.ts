/** Caminhos de navegação da aplicação. */
export const paths = {
  home: '/',
  element: (symbol: string) => `/elemento/${encodeURIComponent(symbol)}`,
} as const;
