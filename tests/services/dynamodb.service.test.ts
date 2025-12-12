import { AuthSessionRecord } from 'src/types/auth.types';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({
      send: mockSend,
    }),
  },
  PutCommand: jest.fn().mockImplementation((input) => ({ input })),
  DeleteCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

// Import after mocking
import { storeAuthSessionRecord, getAndDeleteAuthSessionRecord } from '@services/dynamodb.service';

describe('dynamodb.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeAuthSessionRecord', () => {
    it('should store auth session record with TTL', async () => {
      const mockRecord: Omit<AuthSessionRecord, 'ttl'> = {
        state: 'test-state',
        nonce: 'test-nonce',
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
        createdAt: '2021-01-01T00:00:00.000Z',
      };

      const beforeCallTime = Math.floor(Date.now() / 1000);
      mockSend.mockResolvedValue({});

      await storeAuthSessionRecord(mockRecord);

      const afterCallTime = Math.floor(Date.now() / 1000);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const putCommandCall = mockSend.mock.calls[0][0];
      const item = putCommandCall.input.Item;

      expect(putCommandCall.input.TableName).toEqual(expect.any(String));
      expect(item.state).toBe(mockRecord.state);
      expect(item.nonce).toBe(mockRecord.nonce);
      expect(item.return_to_url).toBe(mockRecord.return_to_url);
      expect(item.contact_email).toBe(mockRecord.contact_email);
      expect(item.createdAt).toBe(mockRecord.createdAt);
      expect(item.ttl).toBeGreaterThanOrEqual(beforeCallTime + 299); // Allow 1 second buffer before
      expect(item.ttl).toBeLessThanOrEqual(afterCallTime + 301); // Allow 1 second buffer after
    });

    it('should handle DynamoDB errors', async () => {
      const mockRecord: Omit<AuthSessionRecord, 'ttl'> = {
        state: 'test-state',
        nonce: 'test-nonce',
        return_to_url: 'https://example.com',
        contact_email: 'test@example.com',
        createdAt: '2021-01-01T00:00:00.000Z',
      };

      mockSend.mockRejectedValue(new Error('DynamoDB error'));

      await expect(storeAuthSessionRecord(mockRecord)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('getAndDeleteAuthSessionRecord', () => {
    it('should atomically get and delete auth session record', async () => {
      const mockState = 'test-state';
      const mockRecord: AuthSessionRecord = {
        state: mockState,
        nonce: 'test-nonce',
        return_to_url: 'https://example.com/return',
        contact_email: 'user@example.com',
        createdAt: '2021-01-01T00:00:00.000Z',
        ttl: 1609459380,
      };

      mockSend.mockResolvedValue({ Attributes: mockRecord });

      const result = await getAndDeleteAuthSessionRecord(mockState);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const deleteCommandCall = mockSend.mock.calls[0][0];
      expect(deleteCommandCall.input).toMatchObject({
        TableName: expect.any(String),
        Key: { state: mockState },
        ConditionExpression: 'attribute_exists(#state)',
        ReturnValues: 'ALL_OLD',
      });
      expect(result).toEqual(mockRecord);
    });

    it('should return null when record does not exist', async () => {
      const mockState = 'non-existent-state';
      const error: any = new Error('Conditional check failed');
      error.name = 'ConditionalCheckFailedException';

      mockSend.mockRejectedValue(error);

      const result = await getAndDeleteAuthSessionRecord(mockState);

      expect(result).toBeNull();
    });

    it('should return null when record already deleted (replay attack blocked)', async () => {
      const mockState = 'already-used-state';
      const error: any = new Error('Conditional check failed');
      error.name = 'ConditionalCheckFailedException';

      mockSend.mockRejectedValue(error);

      const result = await getAndDeleteAuthSessionRecord(mockState);

      expect(result).toBeNull();
    });

    it('should throw error for other DynamoDB errors', async () => {
      const mockState = 'test-state';
      const error = new Error('Internal server error');

      mockSend.mockRejectedValue(error);

      await expect(getAndDeleteAuthSessionRecord(mockState)).rejects.toThrow('Internal server error');
    });

    it('should return null when Attributes is undefined', async () => {
      const mockState = 'test-state';
      mockSend.mockResolvedValue({ Attributes: undefined });

      const result = await getAndDeleteAuthSessionRecord(mockState);

      expect(result).toBeNull();
    });
  });
});
