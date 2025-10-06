import config from '@config/env';

// TODO: add generic error and allowedOrigins in env.ts

export const getErrorPageFromReturnTo = (returnTo: string, errorPage?: string): string => {
  const safeUrl = sanitizedReturnTo(returnTo);
  const baseUrl = new URL(safeUrl).origin;
  return `${baseUrl}/${errorPage || 'generic-error'}`;
};

const isValidReturnTo = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // only allow-list of trusted origins
    const allowedOrigins = [config.cac.homeUrl, config.cac.ioUrl, config.cac.sendUrl, config.cac.pagopaUrl];
    return allowedOrigins.includes(parsedUrl.origin);
  } catch {
    return false;
  }
};

export const sanitizedReturnTo = (returnTo: string) =>
  returnTo && isValidReturnTo(returnTo) ? returnTo : config.cac.homeUrl;
