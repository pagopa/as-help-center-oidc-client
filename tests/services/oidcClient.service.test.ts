import {
  initializeClient,
  generateAuthUrl,
  handleCallback,
  extractCallbackParams,
  isInitialized,
  getClientOrThrow,
} from '@services/oidcClient.service';
import { Issuer, Client } from 'openid-client';
import { Request } from 'express';

jest.mock('openid-client');

// Note: This service uses a singleton pattern for the OIDC client
describe('oidcClient.service', () => {
  let mockClient: jest.Mocked<Partial<Client>>;

  beforeAll(() => {
    mockClient = {
      authorizationUrl: jest.fn(),
      callback: jest.fn(),
      callbackParams: jest.fn(),
    };

    (Issuer as jest.MockedClass<typeof Issuer>).mockImplementation(
      () =>
        ({
          Client: jest.fn().mockImplementation(() => mockClient),
        }) as any,
    );

    // Initialize the client once for all tests
    initializeClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClientOrInitialize', () => {
    it('should return a client instance', () => {
      const client = getClientOrThrow();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should return same client on subsequent calls', () => {
      const client1 = getClientOrThrow();
      const client2 = getClientOrThrow();
      expect(client1).toBe(client2);
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate authorization URL with state and nonce', () => {
      const state = 'test-state';
      const nonce = 'test-nonce';
      const expectedUrl = 'https://auth.example.com/authorize?state=test&nonce=test';

      (mockClient.authorizationUrl as jest.Mock).mockReturnValue(expectedUrl);

      const result = generateAuthUrl(state, nonce);

      expect(mockClient.authorizationUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          state,
          nonce,
          response_type: 'code',
        }),
      );
      expect(result).toBe(expectedUrl);
    });

    it('should accept additional parameters', () => {
      const state = 'test-state';
      const nonce = 'test-nonce';
      const additionalParams = { prompt: 'login', max_age: 3600 };
      const expectedUrl = 'https://auth.example.com/authorize';

      (mockClient.authorizationUrl as jest.Mock).mockReturnValue(expectedUrl);

      const result = generateAuthUrl(state, nonce, additionalParams);

      expect(mockClient.authorizationUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          state,
          nonce,
          prompt: 'login',
          max_age: 3600,
        }),
      );
      expect(result).toBe(expectedUrl);
    });
  });

  describe('handleCallback', () => {
    it('should handle callback and return token set', async () => {
      const callbackParams = { code: 'auth-code', state: 'test-state' };
      const checks = { state: 'test-state', nonce: 'test-nonce' };
      const mockTokenSet = {
        id_token: 'mock-id-token',
        claims: jest.fn().mockReturnValue({
          sub: 'user-123',
          email: 'user@example.com',
        }),
      };

      (mockClient.callback as jest.Mock).mockResolvedValue(mockTokenSet);

      const result = await handleCallback(callbackParams, checks);

      expect(mockClient.callback).toHaveBeenCalledWith(
        expect.any(String), // redirect URI
        callbackParams,
        checks,
      );
      expect(result.idToken).toBe('mock-id-token');
      expect(result.claims).toEqual({
        sub: 'user-123',
        email: 'user@example.com',
      });
    });

    it('should throw error if callback fails', async () => {
      const callbackParams = { code: 'auth-code', state: 'test-state' };
      const checks = { state: 'test-state', nonce: 'test-nonce' };

      (mockClient.callback as jest.Mock).mockRejectedValue(new Error('Callback failed'));

      await expect(handleCallback(callbackParams, checks)).rejects.toThrow('Callback failed');
    });
  });

  describe('extractCallbackParams', () => {
    it('should extract callback parameters from request', () => {
      const mockRequest = {
        query: { code: 'auth-code', state: 'test-state' },
        url: '/auth/callback?code=auth-code&state=test-state',
        method: 'GET',
      } as Partial<Request>;

      const expectedParams = { code: 'auth-code', state: 'test-state' };
      (mockClient.callbackParams as jest.Mock).mockReturnValue(expectedParams);

      const result = extractCallbackParams(mockRequest as any);

      expect(mockClient.callbackParams).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(expectedParams);
    });

    it('should handle request with error parameter', () => {
      const mockRequest = {
        query: { error: 'access_denied', error_description: 'User denied access' },
        url: '/auth/callback?error=access_denied',
        method: 'GET',
      } as Partial<Request>;

      const expectedParams = {
        error: 'access_denied',
        error_description: 'User denied access',
      };
      (mockClient.callbackParams as jest.Mock).mockReturnValue(expectedParams);

      const result = extractCallbackParams(mockRequest as any);

      expect(mockClient.callbackParams).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(expectedParams);
    });
  });

  describe('isInitialized', () => {
    it('should return boolean value', () => {
      const result = isInitialized();
      expect(typeof result).toBe('boolean');
    });

    it('should return true after client initialization', () => {
      expect(isInitialized()).toBe(true);
    });
  });
});
