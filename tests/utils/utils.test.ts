import { sanitizeLogMessage } from '@utils/utils';

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
});
