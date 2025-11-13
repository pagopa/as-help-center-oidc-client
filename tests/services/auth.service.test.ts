import * as authService from '@services/auth.service';
import * as securityCheckManager from '@services/oidcSecurityCheck.service';
import * as oidcClient from '@services/oidcClient.service';
import * as JwtAuthService from '@services/jwtAuth.service';
import config from '@config/env';
import { loginFormAutoSubmit } from '@utils/zendeskRedirect';
import { ApiError } from '@errors/ApiError';
import { CallbackParamsType } from 'openid-client';

jest.mock('@services/oidcSecurityCheck.service');
jest.mock('@services/oidcClient.service');
jest.mock('@services/jwtAuth.service');
jest.mock('@utils/zendeskRedirect');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAuthenticationUrlForLogin', () => {
    it('should generate state and nonce with return_to and contact_email', async () => {
      const return_to = 'https://example.com/return';
      const contact_email = 'user@example.com';
      const mockState = 'generated-state';
      const mockNonce = 'generated-nonce';
      const mockAuthUrl = 'https://auth.example.com/authorize';

      (securityCheckManager.createStateAndNonce as jest.Mock).mockReturnValue({
        state: mockState,
        nonce: mockNonce,
      });
      (oidcClient.generateAuthUrl as jest.Mock).mockReturnValue(mockAuthUrl);

      const result = await authService.generateAuthenticationUrlForLogin(return_to, contact_email);

      expect(securityCheckManager.createStateAndNonce).toHaveBeenCalledWith({
        return_to_url: return_to,
        contact_email: contact_email,
      });
      expect(oidcClient.generateAuthUrl).toHaveBeenCalledWith(mockState, mockNonce);
      expect(result).toBe(mockAuthUrl);
    });
  });

  describe('handleLoginCallbackAndGenerateAutoSubmitForm', () => {
    const mockParams: CallbackParamsType = {
      code: 'auth-code',
      state: 'valid-state',
    };

    const mockStatePayload = {
      nonce: 'nonce-value',
      return_to_url: 'https://assistenza.pagopa.gov.it/hc/it',
      contact_email: 'user@example.com',
      stateValue: 'state-value',
    };

    const mockClaims = {
      name: 'Mario',
      familyName: 'Rossi',
      fiscalNumber: 'RSSMRA80A01H501U',
      nonce: 'nonce-value',
    };

    it('should successfully process valid callback', async () => {
      const mockJwtToken = 'generated.jwt.token';
      const mockHtmlForm = '<html>...</html>';

      (securityCheckManager.validateAndGetState as jest.Mock).mockReturnValue(mockStatePayload);
      (oidcClient.handleCallback as jest.Mock).mockResolvedValue({ claims: mockClaims });
      (securityCheckManager.validateNonce as jest.Mock).mockReturnValue(undefined);
      (JwtAuthService.generateAuthJwt as jest.Mock).mockReturnValue(mockJwtToken);
      (loginFormAutoSubmit as jest.Mock).mockReturnValue(mockHtmlForm);

      const result = await authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams);

      expect(securityCheckManager.validateAndGetState).toHaveBeenCalledWith(mockParams.state);
      expect(oidcClient.handleCallback).toHaveBeenCalledWith(mockParams, {
        state: mockParams.state,
        nonce: mockStatePayload.nonce,
      });
      expect(securityCheckManager.validateNonce).toHaveBeenCalledWith(mockStatePayload.nonce, mockClaims.nonce);
      expect(JwtAuthService.generateAuthJwt).toHaveBeenCalledWith(
        'Mario Rossi',
        config.authJwt.jwtTokenOrganizationClaim,
        mockStatePayload.contact_email,
        mockClaims.fiscalNumber,
      );
      expect(loginFormAutoSubmit).toHaveBeenCalledWith(
        config.authJwt.loginActionEndpoint,
        mockJwtToken,
        mockStatePayload.return_to_url,
      );
      expect(result).toBe(mockHtmlForm);
    });

    it('should throw ApiError when provider returns error', async () => {
      const errorParams: CallbackParamsType = {
        error: 'access_denied',
        error_description: 'User denied access',
        state: 'valid-state',
      };

      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(errorParams)).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when code is missing', async () => {
      const paramsWithoutCode: CallbackParamsType = {
        state: 'valid-state',
      };

      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(paramsWithoutCode)).rejects.toThrow(
        ApiError,
      );
      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(paramsWithoutCode)).rejects.toThrow(
        'Missing code required parameters',
      );
    });

    it('should throw ApiError when state validation fails', async () => {
      (securityCheckManager.validateAndGetState as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid state');
      });

      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(ApiError);
      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(
        'State validation error',
      );
    });

    it('should throw ApiError when token exchange fails', async () => {
      (securityCheckManager.validateAndGetState as jest.Mock).mockReturnValue(mockStatePayload);
      (oidcClient.handleCallback as jest.Mock).mockRejectedValue(new Error('Token exchange failed'));

      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(ApiError);
      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(
        'Token exchange error',
      );
    });

    it('should throw ApiError when nonce validation fails', async () => {
      (securityCheckManager.validateAndGetState as jest.Mock).mockReturnValue(mockStatePayload);
      (oidcClient.handleCallback as jest.Mock).mockResolvedValue({ claims: mockClaims });
      (securityCheckManager.validateNonce as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid nonce');
      });

      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(ApiError);
      await expect(authService.handleLoginCallbackAndGenerateAutoSubmitForm(mockParams)).rejects.toThrow(
        'Nonce validation error',
      );
    });
  });
});
