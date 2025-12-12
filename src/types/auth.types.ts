import { IdTokenClaims } from 'openid-client';

export type ExtraStateData = {
  return_to_url: string;
  contact_email: string;
};

export type StateAndNonce = {
  state: string;
  nonce: string;
};

export interface AuthSessionRecord {
  state: string; // PK
  nonce: string;
  return_to_url: string;
  contact_email: string;
  createdAt: string;
  ttl: number; // Unix timestamp for TTL expiration
}

export type AccessTokenClaims = IdTokenClaims & {
  name?: string;
  familyName?: string;
  fiscalNumber?: string;
};

export type ExchangedTokenSet = {
  idToken?: string;
  claims: AccessTokenClaims;
};
