import config from '@config/env';

export const getErrorPageFromReturnTo = (returnTo: string) => {
  const baseUrl = returnTo ? new URL(returnTo).origin : config.cac.homeUrl;
  return `${baseUrl}/generic-error`;
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
