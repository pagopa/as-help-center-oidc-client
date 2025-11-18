import { has, isNil } from 'lodash';
import dns from 'dns/promises';

export const sanitizeLogMessage = (rawMessage: unknown): string =>
  (typeof rawMessage === 'string' ? rawMessage : '').replace(/[\n\r]/g, '').slice(0, 500);

export const validateRequiredFields = (
  obj: Record<string, unknown> | undefined,
  required: readonly string[],
  messagePrefix: string,
): void => {
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

export const validateEmailDomain = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  try {
    // Check if exists mx records (mail) - if the domain can receive emails
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    // fallback: check if exists a records (dns)
    try {
      const aRecords = await dns.resolve(domain);
      return aRecords && aRecords.length > 0;
    } catch {
      return false;
    }
  }
};

export const stringToBool = (value?: string): boolean => {
  return value?.toLowerCase() === 'true';
};
