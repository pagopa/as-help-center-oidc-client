import config from '@config/env';

export const getHCUrlFromBrandId = (brandId?: string): string => {
  const brandOrigins: Record<string, string> = {
    [config.cac.homeBrandId]: config.cac.homeUrl,
    [config.cac.ioBrandId]: config.cac.ioUrl,
    [config.cac.sendBrandId]: config.cac.sendUrl,
    [config.cac.pagopaBrandId]: config.cac.pagopaUrl,
  };

  const origin = brandId ? brandOrigins[brandId] || config.cac.homeUrl : config.cac.homeUrl;
  return origin;
};

// TODO: use this or send res error and then handle error page redirection on FE side ?
export const getErrorPageFromBrandId = (brandId?: string) => {
  return `${getHCUrlFromBrandId(brandId)}/generic-error`;
};

const isValidReturnTo = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // only allow-list of trusted origins
    const allowedOrigins = [
      new URL(config.cac.homeUrl).origin,
      new URL(config.cac.ioUrl).origin,
      new URL(config.cac.sendUrl).origin,
      new URL(config.cac.pagopaUrl).origin,
    ];
    return allowedOrigins.includes(parsedUrl.origin);
  } catch {
    return false;
  }
};

export const sanitizedReturnTo = (returnTo?: string) =>
  returnTo && isValidReturnTo(returnTo) ? returnTo : config.cac.homeUrl;
