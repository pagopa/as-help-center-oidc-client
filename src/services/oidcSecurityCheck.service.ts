import config from '@config/env';
import jwt from 'jsonwebtoken';
import { generators } from 'openid-client';
import { ExtraStateData, StateAndNonce, StateJwtPayload } from 'src/types/auth.types';

const STATE_TOKEN_SECRET = config.stateJwt.secret;
const STATE_TOKEN_EXPIRING = config.stateJwt.expiring;
const JWT_ALGORITHM = 'HS256';

// create new state and nonce
// state will be a jwt signed token in order to maintain code stateless (state token will be verified with secret key between different api calls)
export function createStateAndNonce(extraStateData: ExtraStateData): StateAndNonce {
  const stateValue = generators.state();
  const nonce = generators.nonce();

  const statePayload = {
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    stateValue,
    nonce,
    return_to_url: extraStateData.return_to_url,
    contact_email: extraStateData.contact_email,
  };

  const state = jwt.sign(statePayload, STATE_TOKEN_SECRET, {
    expiresIn: STATE_TOKEN_EXPIRING,
    algorithm: JWT_ALGORITHM,
  });

  return { state, nonce };
}

// validate the token state and return the payload
export function validateAndGetState(state?: string): StateJwtPayload {
  if (!state) {
    throw new Error('State parameter is required');
  }

  try {
    const statePayload = jwt.verify(state, STATE_TOKEN_SECRET) as StateJwtPayload;
    return statePayload;
  } catch (jwtError) {
    console.error('JWT validation error:', jwtError);
    throw new Error('State is not valid');
  }
}

// validate nonce attribute (if present and if it is equal to initial nonce)
export function validateNonce(nonce?: string, nonceFromProvider?: string) {
  if (!nonceFromProvider) {
    throw new Error('Nonce parameter is required');
  }

  if (nonceFromProvider !== nonce) {
    throw new Error('Nonce is not valid');
  }
}
