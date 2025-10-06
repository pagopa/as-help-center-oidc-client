/**
 * Sanitizes a message for logging. It ensures the input is a string,
 * removes all non-printable ASCII characters, and truncates the message to a safe length
 * @param rawMessage The message to sanitize.
 * @returns A sanitized string safe for logging.
 */
export const sanitizeLogMessage = (rawMessage: unknown): string => {
  const message = typeof rawMessage === 'string' ? rawMessage : '';
  const sanitizedMessage = message.replace(/[^\x20-\x7E]/g, '');
  return sanitizedMessage.slice(0, 500);
};
