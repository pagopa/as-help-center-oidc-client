import config from '@config/env';

export const getErrorPageFromReturnTo = (returnTo: string) => {
  const baseUrl = returnTo ? new URL(returnTo).origin : config.cac.homeUrl;
  return `${baseUrl}/generic-error`;
};
