import { JwtPayload } from 'jsonwebtoken';
import { IdTokenClaims } from 'openid-client';

export type ExtraStateData = {
  return_to_url: string;
  contact_email: string;
};

export type StateAndNonce = {
  state: string;
  nonce: string;
};

export type StateJwtPayload = JwtPayload & {
  timestamp?: number;
  createdAt?: string;
  stateValue: string;
  nonce: string;
  return_to_url: string;
  contact_email: string;
};

export type AccessTokenClaims = IdTokenClaims & {
  name?: string;
  familyName?: string;
  fiscalNumber?: string;
};

export type ExchangedTokenSet = {
  idToken?: string;
  claims: AccessTokenClaims;
};
