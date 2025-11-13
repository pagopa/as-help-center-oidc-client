import { sanitizeLogMessage, validateRequiredFields, validateEmailDomain } from '@utils/utils';
import dns from 'dns/promises';

jest.mock('dns/promises');

describe('utils', () => {
  describe('sanitizeLogMessage', () => {
    it('should return sanitized string for valid string input', () => {
      const message = 'This is a valid log message';
      const result = sanitizeLogMessage(message);
      expect(result).toBe(message);
    });

    it('should remove newline characters from string', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const result = sanitizeLogMessage(message);
      expect(result).toBe('Line 1Line 2Line 3');
    });

    it('should remove carriage return characters from string', () => {
      const message = 'Line 1\rLine 2\rLine 3';
      const result = sanitizeLogMessage(message);
      expect(result).toBe('Line 1Line 2Line 3');
    });

    it('should remove both newline and carriage return characters', () => {
      const message = 'Line 1\r\nLine 2\n\rLine 3';
      const result = sanitizeLogMessage(message);
      expect(result).toBe('Line 1Line 2Line 3');
    });

    it('should truncate message to 500 characters', () => {
      const message = 'a'.repeat(600);
      const result = sanitizeLogMessage(message);
      expect(result).toHaveLength(500);
      expect(result).toBe('a'.repeat(500));
    });

    it('should truncate message after removing newlines', () => {
      const message = 'a'.repeat(250) + '\n' + 'b'.repeat(250) + '\n' + 'c'.repeat(100);
      const result = sanitizeLogMessage(message);
      expect(result).toHaveLength(500);
      expect(result).toBe('a'.repeat(250) + 'b'.repeat(250));
    });

    it('should return empty string for non-string input (number)', () => {
      const result = sanitizeLogMessage(123);
      expect(result).toBe('');
    });

    it('should return empty string for non-string input (object)', () => {
      const result = sanitizeLogMessage({ key: 'value' });
      expect(result).toBe('');
    });

    it('should return empty string for non-string input (array)', () => {
      const result = sanitizeLogMessage(['item1', 'item2']);
      expect(result).toBe('');
    });

    it('should return empty string for non-string input (boolean)', () => {
      const result = sanitizeLogMessage(true);
      expect(result).toBe('');
    });

    it('should return empty string for null input', () => {
      const result = sanitizeLogMessage(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const result = sanitizeLogMessage(undefined);
      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = sanitizeLogMessage('');
      expect(result).toBe('');
    });

    it('should handle string with only newlines', () => {
      const result = sanitizeLogMessage('\n\n\n\r\r\r');
      expect(result).toBe('');
    });

    it('should handle complex message with multiple issues', () => {
      const message = 'Error:\n' + 'a'.repeat(600) + '\r\nStack trace';
      const result = sanitizeLogMessage(message);
      expect(result).toHaveLength(500);
      expect(result).not.toContain('\n');
      expect(result).not.toContain('\r');
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw when all required fields are present and valid', () => {
      const obj = { name: 'John', email: 'john@test.com', age: 30 };
      expect(() => validateRequiredFields(obj, ['name', 'email'], 'Test validation')).not.toThrow();
    });

    it('should throw when payload is undefined', () => {
      expect(() => validateRequiredFields(undefined, ['name'], 'Test validation')).toThrow(
        'Test validation: payload missing',
      );
    });

    it('should throw when a required field is missing', () => {
      const obj = { name: 'John' };
      expect(() => validateRequiredFields(obj, ['name', 'email'], 'Test validation')).toThrow('Test validation: email');
    });

    it('should throw when multiple required fields are missing or null or undefined', () => {
      const obj = { name: 'John', email: null, fiscalCode: undefined };
      expect(() => validateRequiredFields(obj, ['name', 'email', 'age', 'fiscalCode'], 'Test validation')).toThrow(
        'Test validation: email, age',
      );
    });

    it('should work with empty required fields array', () => {
      const obj = { name: 'John' };
      expect(() => validateRequiredFields(obj, [], 'Test validation')).not.toThrow();
    });

    it('should validate nested object fields', () => {
      const obj = { user: { name: 'John' }, email: 'test@test.com' };
      expect(() => validateRequiredFields(obj, ['user', 'email'], 'Test validation')).not.toThrow();
    });
  });

  describe('validateEmailDomain', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should return true when MX records exist', async () => {
      (dns.resolveMx as jest.Mock).mockResolvedValue([{ exchange: 'mx1', priority: 10 }]);

      const result = await validateEmailDomain('user@example.com');

      expect(dns.resolveMx).toHaveBeenCalledWith('example.com');
      expect(result).toBe(true);
    });

    it('should return true when MX fails but A records exist', async () => {
      (dns.resolveMx as jest.Mock).mockRejectedValue(new Error('no mx'));
      (dns.resolve as jest.Mock).mockResolvedValue(['1.2.3.4']);

      const result = await validateEmailDomain('user@domain.test');

      expect(dns.resolveMx).toHaveBeenCalledWith('domain.test');
      expect(dns.resolve).toHaveBeenCalledWith('domain.test');
      expect(result).toBe(true);
    });

    it('should return false when both MX and A lookups fail', async () => {
      (dns.resolveMx as jest.Mock).mockRejectedValue(new Error('no mx'));
      (dns.resolve as jest.Mock).mockRejectedValue(new Error('no a'));

      const result = await validateEmailDomain('user@nope.test');

      expect(dns.resolveMx).toHaveBeenCalledWith('nope.test');
      expect(dns.resolve).toHaveBeenCalledWith('nope.test');
      expect(result).toBe(false);
    });

    it('should return false for emails without domain or with empty domain', async () => {
      expect(await validateEmailDomain('no-at-symbol')).toBe(false);
      expect(await validateEmailDomain('user@')).toBe(false);
    });
  });
});
