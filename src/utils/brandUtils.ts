import config from '@config/env';

export const getHCUrlFromBrandId = (brandId?: string): string => {
  const brandOrigins: Record<string, string> = {
    brandA: config.cac.homeUrl,
    brandB: config.cac.ioUrl,
    brandC: config.cac.sendUrl,
    brandD: config.cac.pagopaUrl,
  };

  const origin = brandId ? brandOrigins[brandId] : config.cac.homeUrl;
  return origin;
};

export const getErrorPageFromBrandId = (brandId?: string) => {
  return `${getHCUrlFromBrandId(brandId)}/generic-error`;
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

export const sanitizedReturnTo = (returnTo?: string) =>
  returnTo && isValidReturnTo(returnTo) ? returnTo : config.cac.homeUrl;
