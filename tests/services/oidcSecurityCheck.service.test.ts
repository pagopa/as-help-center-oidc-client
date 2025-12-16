import {
  createStateAndNonce,
  validateStateAndGetAuthSession,
  validateNonce,
} from '@services/oidcSecurityCheck.service';
import { generators } from 'openid-client';
import * as utils from '@utils/utils';
import * as dynamodbService from '@services/dynamodb.service';

jest.mock('@services/dynamodb.service');
jest.mock('openid-client', () => ({
  generators: {
    state: jest.fn(),
    nonce: jest.fn(),
  },
}));
jest.mock('@utils/utils', () => ({
  ...jest.requireActual('@utils/utils'),
  validateRequiredFields: jest.fn(),
}));

describe('oidcSecurityCheck.service', () => {
  const mockGenerators = generators as jest.Mocked<typeof generators>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2021-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createStateAndNonce', () => {
    it('should create state and nonce with extra data and save to DynamoDB', async () => {
      const extraData = {
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
      };
      const mockStateValue = 'generated-state-value';
      const mockNonceValue = 'generated-nonce-value';

      mockGenerators.state.mockReturnValue(mockStateValue);
      mockGenerators.nonce.mockReturnValue(mockNonceValue);
      (dynamodbService.storeAuthSessionRecord as jest.Mock).mockResolvedValue(undefined);

      const result = await createStateAndNonce(extraData);

      expect(mockGenerators.state).toHaveBeenCalled();
      expect(mockGenerators.nonce).toHaveBeenCalled();
      expect(dynamodbService.storeAuthSessionRecord).toHaveBeenCalledWith({
        state: mockStateValue,
        nonce: mockNonceValue,
        return_to_url: extraData.return_to_url,
        contact_email: extraData.contact_email,
        createdAt: '2021-01-01T00:00:00.000Z',
      });
      expect(result).toEqual({
        state: mockStateValue,
        nonce: mockNonceValue,
      });
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const extraData = { return_to_url: 'https://example.com', contact_email: 'test@example.com' };
      mockGenerators.state.mockReturnValue('state');
      mockGenerators.nonce.mockReturnValue('nonce');
      (dynamodbService.storeAuthSessionRecord as jest.Mock).mockRejectedValue(new Error('DynamoDB error'));

      await expect(createStateAndNonce(extraData)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('validateStateAndGetAuthSession', () => {
    it('should atomically get and delete auth session from DynamoDB', async () => {
      const mockState = 'valid-state-id';
      const mockStateRecord = {
        state: mockState,
        nonce: 'nonce-value',
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
        createdAt: '2021-01-01T00:00:00.000Z',
        ttl: 1609459380,
      };

      (dynamodbService.getAndDeleteAuthSessionRecord as jest.Mock).mockResolvedValue(mockStateRecord);

      const result = await validateStateAndGetAuthSession(mockState);

      expect(dynamodbService.getAndDeleteAuthSessionRecord).toHaveBeenCalledWith(mockState);
      expect(utils.validateRequiredFields).toHaveBeenCalledWith(
        mockStateRecord,
        ['state', 'nonce', 'return_to_url', 'contact_email'],
        'Missing required auth session record fields',
      );
      expect(result).toEqual(mockStateRecord);
    });

    it('should throw error when state is undefined', async () => {
      await expect(validateStateAndGetAuthSession(undefined)).rejects.toThrow('State parameter is required');
      expect(dynamodbService.getAndDeleteAuthSessionRecord).not.toHaveBeenCalled();
    });

    it('should throw error when state is empty string', async () => {
      await expect(validateStateAndGetAuthSession('')).rejects.toThrow('State parameter is required');
      expect(dynamodbService.getAndDeleteAuthSessionRecord).not.toHaveBeenCalled();
    });

    it('should throw error when state not found or already used (replay attack blocked)', async () => {
      const mockState = 'non-existent-or-used-state';
      (dynamodbService.getAndDeleteAuthSessionRecord as jest.Mock).mockResolvedValue(null);

      await expect(validateStateAndGetAuthSession(mockState)).rejects.toThrow('State not found or already used');
    });

    it('should throw error when state is expired (TTL)', async () => {
      const mockState = 'expired-state';
      (dynamodbService.getAndDeleteAuthSessionRecord as jest.Mock).mockResolvedValue(null);

      await expect(validateStateAndGetAuthSession(mockState)).rejects.toThrow('State not found or already used');
    });

    it('should throw error when required auth session fields are missing', async () => {
      const mockState = 'valid-state';
      const mockStateRecord = {
        state: mockState,
        nonce: 'nonce-value',
        // Missing return_to_url and contact_email
        createdAt: '2021-01-01T00:00:00.000Z',
        ttl: 1609459380,
      } as any;

      (dynamodbService.getAndDeleteAuthSessionRecord as jest.Mock).mockResolvedValue(mockStateRecord);
      (utils.validateRequiredFields as jest.Mock).mockImplementation(() => {
        throw new Error('Missing required auth session record fields: return_to_url, contact_email');
      });

      await expect(validateStateAndGetAuthSession(mockState)).rejects.toThrow(
        'Missing required auth session record fields: return_to_url, contact_email',
      );
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
