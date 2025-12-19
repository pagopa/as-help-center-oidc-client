import { Request, Response } from 'express';
import { login, callback, logout } from '@controllers/auth.controller';
import * as authService from '@services/auth.service';
import * as oidcClient from '@services/oidcClient.service';
import { getErrorPageFromBrandId, sanitizedReturnTo } from '@utils/brandUtils';
import { sanitizeLogMessage } from '@utils/utils';

jest.mock('@services/auth.service');
jest.mock('@services/oidcClient.service');
jest.mock('@utils/brandUtils');
jest.mock('@utils/utils');

describe('auth.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockResponse = {
      redirect: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('login', () => {
    it('should call auth service with return_to and contact_email', async () => {
      const return_to = 'https://example.com/return';
      const contact_email = 'user@example.com';
      mockRequest = {
        query: { return_to, contact_email },
      };

      const mockAuthUrl = 'https://auth.example.com/authorize';
      (authService.generateAuthenticationUrlForLogin as jest.Mock).mockResolvedValue(mockAuthUrl);

      await login(mockRequest as any, mockResponse as Response);

      expect(authService.generateAuthenticationUrlForLogin).toHaveBeenCalledWith(return_to, contact_email);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockAuthUrl);
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
    });
  });

  describe('callback', () => {
    const mockParams = {
      code: 'auth-code',
      state: 'valid-state',
    };

    beforeEach(() => {
      mockRequest = { query: {} };
      (oidcClient.extractCallbackParams as jest.Mock).mockReturnValue(mockParams);
    });

    it('should extract callback params and send HTML form returned by service', async () => {
      const mockHtmlForm = '<html>...</html>';
      (authService.handleLoginCallbackAndGenerateAutoSubmitForm as jest.Mock).mockResolvedValue(mockHtmlForm);

      await callback(mockRequest as any, mockResponse as Response);

      expect(oidcClient.extractCallbackParams).toHaveBeenCalledWith(mockRequest);
      expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm).toHaveBeenCalledWith(mockParams);
      expect(mockResponse.send).toHaveBeenCalledWith(mockHtmlForm);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should redirect to error page when kind is "error"', async () => {
      const brand_id = '30056696712977';
      const message = 'JWT token expired';
      const return_to = 'https://example.com';

      mockRequest = {
        query: {
          kind: 'error',
          brand_id,
          message,
          return_to,
        },
      };

      const mockErrorPage = 'https://example.com/generic-error';
      (sanitizeLogMessage as jest.Mock).mockReturnValue(message);
      (getErrorPageFromBrandId as jest.Mock).mockReturnValue(mockErrorPage);

      await logout(mockRequest as any, mockResponse as Response);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Zendesk login error during logout',
        `brand_id: ${brand_id}, message: ${message}`,
      );
      expect(sanitizeLogMessage).toHaveBeenCalledWith(message);
      expect(getErrorPageFromBrandId).toHaveBeenCalledWith(return_to);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockErrorPage);
    });

    it('should redirect to sanitized return_to for normal logout', async () => {
      const return_to = 'https://example.com/home';
      const sanitizedUrl = 'https://example.com/home';

      mockRequest = {
        query: {
          return_to,
        },
      };

      (sanitizedReturnTo as jest.Mock).mockReturnValue(sanitizedUrl);

      await logout(mockRequest as any, mockResponse as Response);

      expect(sanitizedReturnTo).toHaveBeenCalledWith(return_to);
      expect(mockResponse.redirect).toHaveBeenCalledWith(sanitizedUrl);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
