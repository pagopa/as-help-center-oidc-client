import { getHCUrlFromBrandId, getErrorPageFromBrandId, sanitizedReturnTo } from '@utils/brandUtils';
import config from '@config/env';

describe('brandUtils', () => {
  describe('getHCUrlFromBrandId', () => {
    it('should return homeUrl for brand ID 30056696712977', () => {
      const result = getHCUrlFromBrandId('30056696712977');
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should return ioUrl for brand ID 30056501290385', () => {
      const result = getHCUrlFromBrandId('30056501290385');
      expect(result).toBe(config.cac.ioUrl);
    });

    it('should return sendUrl for brand ID 30056681477393', () => {
      const result = getHCUrlFromBrandId('30056681477393');
      expect(result).toBe(config.cac.sendUrl);
    });

    it('should return pagopaUrl for brand ID 30056686396177', () => {
      const result = getHCUrlFromBrandId('30056686396177');
      expect(result).toBe(config.cac.pagopaUrl);
    });

    it('should return homeUrl for unknown brand ID', () => {
      const result = getHCUrlFromBrandId('unknown-brand-id');
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should return homeUrl when brandId is undefined', () => {
      const result = getHCUrlFromBrandId();
      expect(result).toBe(config.cac.homeUrl);
    });
  });

  describe('getErrorPageFromBrandId', () => {
    it('should return error page URL for valid brand ID', () => {
      const result = getErrorPageFromBrandId('30056696712977');
      expect(result).toBe(`${config.cac.homeUrl}/generic-error`);
    });

    it('should return error page URL with homeUrl for unknown brand ID', () => {
      const result = getErrorPageFromBrandId('unknown-brand-id');
      expect(result).toBe(`${config.cac.homeUrl}/generic-error`);
    });

    it('should return error page URL with homeUrl when brandId is undefined', () => {
      const result = getErrorPageFromBrandId();
      expect(result).toBe(`${config.cac.homeUrl}/generic-error`);
    });
  });

  describe('sanitizedReturnTo', () => {
    it('should return returnTo when URL has valid origin', () => {
      // Use exact config values to build valid URLs
      const result = sanitizedReturnTo(config.cac.homeUrl);
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should accept URLs with same origin as ioUrl', () => {
      const homeUrlOrigin = new URL(config.cac.ioUrl).origin;
      const returnTo = `${homeUrlOrigin}/different-path`;
      const result = sanitizedReturnTo(returnTo);
      // Should return the URL if origin matches
      expect(returnTo).toBe(result);
    });

    it('should accept URLs with same origin as ioUrl', () => {
      const result = sanitizedReturnTo(config.cac.ioUrl);
      expect(result).toBe(config.cac.ioUrl);
    });

    it('should accept URLs with same origin as sendUrl', () => {
      const result = sanitizedReturnTo(config.cac.sendUrl);
      expect(result).toBe(config.cac.sendUrl);
    });

    it('should accept URLs with same origin as pagopaUrl', () => {
      const result = sanitizedReturnTo(config.cac.pagopaUrl);
      expect(result).toBe(config.cac.pagopaUrl);
    });

    it('should return homeUrl for untrusted origin', () => {
      const returnTo = 'https://malicious-site.com/path';
      const result = sanitizedReturnTo(returnTo);
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should return homeUrl for invalid URL', () => {
      const returnTo = 'not-a-valid-url';
      const result = sanitizedReturnTo(returnTo);
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should return homeUrl when returnTo is undefined', () => {
      const result = sanitizedReturnTo();
      expect(result).toBe(config.cac.homeUrl);
    });

    it('should return homeUrl when returnTo is empty string', () => {
      const result = sanitizedReturnTo('');
      expect(result).toBe(config.cac.homeUrl);
    });
  });
});
