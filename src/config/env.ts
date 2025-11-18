import dotenv from 'dotenv';
import crypto from 'crypto';
import { NODE_ENV_VALUES } from '@utils/constants';
import { stringToBool } from '@utils/utils';
dotenv.config();

export default {
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'https://slightly-intent-louse.ngrok-free.app',
    environment: process.env.NODE_ENV || NODE_ENV_VALUES.development,
    clientRedirectUri: `${process.env.HOST}/${process.env.CLIENT_REDIRECT_URI || 'auth/callback'}`,
  },

  authJwt: {
    secret: process.env.AUTH_JWT_SECRET ?? throwMissingRequiredEnvVar('AUTH_JWT_SECRET'),
    loginActionEndpoint:
      process.env.JWT_LOGIN_ACTION_ENDPOINT ?? throwMissingRequiredEnvVar('JWT_LOGIN_ACTION_ENDPOINT'),
    jwtTokenOrganizationClaim: process.env.JWT_TOKEN_ORGANIZATION_CLAIM || 'users_hc_cac',
  },

  stateJwt: {
    secret: process.env.STATE_JWT_SECRET || crypto.randomBytes(16).toString('hex'),
    expiring: Number(process.env.STATE_JWT_EXP) || 60 * 3, // 3m
  },

  oidc: {
    issuer: process.env.OIDC_ISSUER ?? throwMissingRequiredEnvVar('OIDC_ISSUER'),
    clientId: process.env.OIDC_CLIENT_ID ?? throwMissingRequiredEnvVar('OIDC_CLIENT_ID'),
    clientSecret: process.env.OIDC_CLIENT_SECRET ?? throwMissingRequiredEnvVar('OIDC_CLIENT_SECRET'),
    scopes: buildOidcScopes(),
    responseType: process.env.OIDC_RESPONSE_TYPE || 'code',
    endpoints: {
      authorize: process.env.OIDC_AUTHORIZE_ENDPOINT || '/oidc/authorize',
      token: process.env.OIDC_TOKEN_ENDPOINT || 'login',
      userinfo: process.env.OIDC_USERINFO_ENDPOINT || '/oidc/userinfo',
      jwks: process.env.OIDC_JWKS_ENDPOINT || '/oidc/keys',
    },
  },

  cac: {
    // urls
    homeUrl: process.env.CAC_HOME_URL || 'https://centroassistenza.pagopa.it/hc/it',
    ioUrl: process.env.CAC_IO_URL || 'https://assistenza.pagopa.gov.it/hc/it',
    sendUrl: process.env.CAC_SEND_URL || 'https://assistenza.notifichedigitali.it/hc/it',
    pagopaUrl: process.env.CAC_PAGOPA_URL || 'https://assistenza.pagopa.gov.it/hc/it',
    // brand ids
    homeBrandId: process.env.HOME_BRAND_ID ?? throwMissingRequiredEnvVar('HOME_BRAND_ID'),
    ioBrandId: process.env.IO_BRAND_ID ?? throwMissingRequiredEnvVar('IO_BRAND_ID'),
    sendBrandId: process.env.SEND_BRAND_ID ?? throwMissingRequiredEnvVar('SEND_BRAND_ID'),
    pagopaBrandId: process.env.PAGOPA_BRAND_ID ?? throwMissingRequiredEnvVar('PAGOPA_BRAND_ID'),
  },

  errorJson: process.env.ERROR_JSON ? stringToBool(process.env.ERROR_JSON) : false,
};

function buildOidcScopes() {
  const scopesCommaSeparated = process.env.OIDC_SCOPES || 'openid';
  return scopesCommaSeparated.split(',').map((s) => s.trim()); // ['openid', 'email', 'profile']
}

function throwMissingRequiredEnvVar(varName: string): never {
  throw new Error(`Missing required env var: ${varName}`);
}
