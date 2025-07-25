export const sanitizeLogMessage = (rawMessage: unknown) =>
  (typeof rawMessage === 'string' ? rawMessage : '').replace(/[\n\r]/g, '').slice(0, 500);
