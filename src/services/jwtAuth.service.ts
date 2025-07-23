import config from '@config/env';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SIGN_ALGORITHM = 'HS256';

export function generateAuthJwt(name?: string, fiscalNumber?: string, org?: string, emailContact?: string) {
  const payload = {
    iat: Math.floor(new Date().getTime() / 1000),
    jti: uuidv4(),
    name: name,
    // email: fiscalNumber + "@pagopa.users",
    email: emailContact,
    organization: org,
    // user_fields: { email_contact: emailContact, fiscalcode: fiscalNumber },
    user_fields: { fiscalcode: fiscalNumber },
  };
  // encode
  return jwt.sign(payload, config.authJwt.secret, {
    expiresIn: config.authJwt.expiring,
    algorithm: JWT_SIGN_ALGORITHM,
  });
}
