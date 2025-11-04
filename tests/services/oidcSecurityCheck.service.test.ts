import { createStateAndNonce, validateAndGetState, validateNonce } from '@services/oidcSecurityCheck.service';
import config from '@config/env';
import jwt from 'jsonwebtoken';
import { generators } from 'openid-client';

jest.mock('jsonwebtoken');
jest.mock('openid-client', () => ({
  generators: {
    state: jest.fn(),
    nonce: jest.fn(),
  },
}));

describe('oidcSecurityCheck.service', () => {
  const mockGenerators = generators as jest.Mocked<typeof generators>;
  const mockJwt = jwt as jest.Mocked<typeof jwt>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1609459200000);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2021-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createStateAndNonce', () => {
    it('should create state and nonce with extra data', () => {
      const extraData = {
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
      };
      const mockStateValue = 'generated-state-value';
      const mockNonceValue = 'generated-nonce-value';
      const mockJwtToken = 'signed.jwt.token';

      mockGenerators.state.mockReturnValue(mockStateValue);
      mockGenerators.nonce.mockReturnValue(mockNonceValue);
      mockJwt.sign.mockReturnValue(mockJwtToken as any);

      const result = createStateAndNonce(extraData);

      expect(mockGenerators.state).toHaveBeenCalled();
      expect(mockGenerators.nonce).toHaveBeenCalled();
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          timestamp: 1609459200000,
          createdAt: '2021-01-01T00:00:00.000Z',
          stateValue: mockStateValue,
          nonce: mockNonceValue,
          return_to_url: extraData.return_to_url,
          contact_email: extraData.contact_email,
        },
        config.stateJwt.secret,
        {
          expiresIn: config.stateJwt.expiring,
          algorithm: 'HS256',
        },
      );
      expect(result).toEqual({
        state: mockJwtToken,
        nonce: mockNonceValue,
      });
    });

    it('should use configured secret and expiration', () => {
      const extraData = { return_to_url: 'https://example.com', contact_email: 'test@example.com' };
      mockGenerators.state.mockReturnValue('state');
      mockGenerators.nonce.mockReturnValue('nonce');
      mockJwt.sign.mockReturnValue('token' as any);

      createStateAndNonce(extraData);

      expect(mockJwt.sign).toHaveBeenCalledWith(expect.any(Object), config.stateJwt.secret, {
        expiresIn: config.stateJwt.expiring,
        algorithm: 'HS256',
      });
    });
  });

  describe('validateAndGetState', () => {
    it('should validate and return state payload', () => {
      const mockState = 'valid.jwt.token';
      const mockPayload = {
        timestamp: 1609459200000,
        createdAt: '2021-01-01T00:00:00.000Z',
        stateValue: 'state-value',
        nonce: 'nonce-value',
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
      };

      mockJwt.verify.mockReturnValue(mockPayload as any);

      const result = validateAndGetState(mockState);

      expect(mockJwt.verify).toHaveBeenCalledWith(mockState, config.stateJwt.secret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error when state is undefined', () => {
      expect(() => validateAndGetState(undefined)).toThrow('State parameter is required');
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    it('should throw error when state is empty string', () => {
      expect(() => validateAndGetState('')).toThrow('State parameter is required');
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    it('should throw error when JWT verification fails', () => {
      const mockState = 'invalid.jwt.token';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockJwt.verify.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      expect(() => validateAndGetState(mockState)).toThrow('State is not valid');
      expect(consoleSpy).toHaveBeenCalledWith('JWT validation error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should throw error when JWT is expired', () => {
      const mockState = 'expired.jwt.token';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      expect(() => validateAndGetState(mockState)).toThrow('State is not valid');

      consoleSpy.mockRestore();
    });

    it('should use configured secret for verification', () => {
      const mockState = 'valid.jwt.token';
      mockJwt.verify.mockReturnValue({} as any);

      validateAndGetState(mockState);

      expect(mockJwt.verify).toHaveBeenCalledWith(mockState, config.stateJwt.secret);
    });
  });

  describe('validateNonce', () => {
    it('should validate matching nonce successfully', () => {
      const nonce = 'test-nonce';
      const nonceFromProvider = 'test-nonce';

      expect(() => validateNonce(nonce, nonceFromProvider)).not.toThrow();
    });

    it('should throw error when nonce does not match', () => {
      const nonce = 'test-nonce';
      const nonceFromProvider = 'different-nonce';

      expect(() => validateNonce(nonce, nonceFromProvider)).toThrow('Nonce is not valid');
    });

    it('should throw error when nonceFromProvider is undefined', () => {
      const nonce = 'test-nonce';

      expect(() => validateNonce(nonce, undefined)).toThrow('Nonce parameter is required');
    });

    it('should throw error when nonceFromProvider is empty string', () => {
      const nonce = 'test-nonce';

      expect(() => validateNonce(nonce, '')).toThrow('Nonce parameter is required');
    });

    it('should validate exact string match (case-sensitive)', () => {
      const nonce = 'TestNonce';
      const nonceFromProvider = 'testnonce';

      expect(() => validateNonce(nonce, nonceFromProvider)).toThrow('Nonce is not valid');
    });
  });
});
