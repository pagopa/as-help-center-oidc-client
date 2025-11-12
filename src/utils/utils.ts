import { has, isNil } from 'lodash';

export const sanitizeLogMessage = (rawMessage: unknown) =>
  (typeof rawMessage === 'string' ? rawMessage : '').replace(/[\n\r]/g, '').slice(0, 500);

export const validateRequiredFields = (
  obj: Record<string, unknown> | undefined,
  required: readonly string[],
  messagePrefix: string,
) => {
  if (!obj) {
    throw new Error(`${messagePrefix}: payload missing`);
  }

  const missing = required.filter((k) => {
    if (!has(obj, k)) return true;
    const v = (obj as any)[k];
    return isNil(v);
  });
  if (missing.length > 0) {
    throw new Error(`${messagePrefix}: ${missing.join(', ')}`);
  }
};
