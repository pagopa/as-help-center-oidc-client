import config from '@config/env';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { generators } from 'openid-client';

const STATE_TOKEN_SECRET = config.stateJwt.secret;
const STATE_TOKEN_EXPIRING = config.stateJwt.expiring;
const JWT_ALGORITHM = 'HS256';

type ExtraStateData = {
  return_to_url: string;
  contact_email: string;
}

// create new state and nonce
// state will be a jwt signed token in order maintain code stateless (state token will be verified between different api calls)
export function createStateAndNonce(extraStateData?: ExtraStateData) {
  console.log(extraStateData?.contact_email, extraStateData?.return_to_url);
  const stateValue = generators.state();
  const nonce = generators.nonce();

  const statePayload = {
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    stateValue,
    nonce,
    ...(extraStateData 
      ? {return_to_url: extraStateData.return_to_url, contact_email: extraStateData.contact_email} 
      : {}
    )
  };

  const state = jwt.sign(statePayload, STATE_TOKEN_SECRET, {
    expiresIn: STATE_TOKEN_EXPIRING,
    algorithm: JWT_ALGORITHM
  });

  return { state, nonce };
}

// validate the token state and return the payload
export function validateAndGetState(state?: string) {
  if (!state) {
    throw new Error('State parameter is required');
  }

  try {
    const statePayload = jwt.verify(state, STATE_TOKEN_SECRET) as JwtPayload; // TODO: custom type
    console.log('State JWT valido:', statePayload);
    return statePayload;
  } catch (jwtError) {
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