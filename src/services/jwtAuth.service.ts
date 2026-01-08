import config from '@config/env';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SIGN_ALGORITHM = 'HS256';

export function generateAuthJwt(name: string, org: string, emailContact: string, fiscalNumber?: string) {
  const normalizedFiscalNumber =
    fiscalNumber && fiscalNumber.startsWith('TINIT-') ? fiscalNumber.substring('TINIT-'.length) : fiscalNumber;

  const payload = {
    iat: Math.floor(new Date().getTime() / 1000),
    jti: uuidv4(),
    name: name,
    email: emailContact,
    organization: org,
    user_fields: { aux_data: normalizedFiscalNumber },
  };
  // encode
  // expiring is automatically set by zendesk, but it works only after an inactivity period (and can be changed - from 5 minutes to 2 weeks)
  return jwt.sign(payload, config.authJwt.secret, {
    algorithm: JWT_SIGN_ALGORITHM,
  });
}
