import dotenv from 'dotenv';
import crypto from 'crypto';
import { NODE_ENV_VALUES } from '@utils/constants';
dotenv.config();

export default {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'https://slightly-intent-louse.ngrok-free.app',
    environment: process.env.NODE_ENV || NODE_ENV_VALUES.development,
    clientRedirectUri: `${process.env.HOST}/auth/callback`,
  },

  authJwt: {
    secret: process.env.AUTH_JWT_SECRET || crypto.randomBytes(16).toString('hex'),
    loginActionEndpoint:
      process.env.JWT_LOGIN_ACTION_ENDPOINT ?? throwMissingRequiredEnvVar('JWT_LOGIN_ACTION_ENDPOINT'),
  },

  stateJwt: {
    secret: process.env.STATE_JWT_SECRET || crypto.randomBytes(16).toString('hex'),
    expiring: Number(process.env.STATE_JWT_EXP) || 60 * 3, // 3m
  },

  oidc: {
    issuer: process.env.OIDC_ISSUER ?? throwMissingRequiredEnvVar('OIDC_ISSUER'),
    clientId: process.env.OIDC_CLIENT_ID ?? throwMissingRequiredEnvVar('OIDC_CLIENT_ID'),
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    scopes: buildOidcScopes(),
    endpoints: {
      authorize: process.env.OIDC_AUTHORIZE_ENDPOINT || '/oidc/authorize',
      token: process.env.OIDC_TOKEN_ENDPOINT || 'login',
      userinfo: process.env.OIDC_USERINFO_ENDPOINT || '/oidc/userinfo',
      jwks: process.env.OIDC_JWKS_ENDPOINT || '/oidc/keys',
    },
  },

  cac: {
    homeUrl: process.env.CAC_HOME_URL || 'https://centroassistenza.pagopa.it/hc/it',
    ioUrl: process.env.CAC_IO_URL || 'https://assistenza.pagopa.gov.it/hc/it',
    sendUrl: process.env.CAC_SEND_URL || 'https://assistenza.notifichedigitali.it/hc/it',
    pagopaUrl: process.env.CAC_PAGOPA_URL || 'https://assistenza.pagopa.gov.it/hc/it',
  },
};

function buildOidcScopes() {
  const scopesCommaSeparated = process.env.OIDC_SCOPES || 'openid';
  return scopesCommaSeparated.split(',').map((s) => s.trim()); // ['openid', 'email', 'profile']
}

function throwMissingRequiredEnvVar(varName: string): never {
  throw new Error(`Missing required env var: ${varName}`);
}
