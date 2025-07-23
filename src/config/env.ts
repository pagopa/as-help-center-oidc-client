import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export default {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'https://slightly-intent-louse.ngrok-free.app',
    environment: process.env.NODE_ENV || 'development',
    clientRedirectUri: `${process.env.HOST}/auth/callback`,
  },

  authJwt: {
    secret: process.env.AUTH_JWT_SECRET || crypto.randomBytes(16).toString('hex'),
    expiring: Number(process.env.AUTH_JWT_EXP) || 60 * 3, // 3m // TODO: check expiring zendesk (if default ecc)
    loginActionEndpoint: process.env.JWT_LOGIN_ACTION_ENDPOINT,
  },

  stateJwt: {
    secret: process.env.STATE_JWT_SECRET || crypto.randomBytes(16).toString('hex'),
    expiring: Number(process.env.STATE_JWT_EXP) || 60 * 3, // 3m
  },

  oidc: {
    issuer: process.env.OIDC_ISSUER || 'https://live-seriously-ghoul.ngrok-free.app/realms/zendesk-test',
    clientId: process.env.OIDC_CLIENT_ID || 'zendesk-client',
    clientSecret: process.env.OIDC_CLIENT_SECRET || 'KaaQFNwZpKDtY1RsezGv64HtKt5U8wWc',
    scopes: buildOidcScopes(),
    endpoints: {
      authorize: process.env.OIDC_AUTHORIZE_ENDPOINT || '/oidc/authorize',
      token: process.env.OIDC_TOKEN_ENDPOINT || 'login',
      userinfo: process.env.OIDC_USERINFO_ENDPOINT || '/oidc/userinfo',
      jwks: process.env.OIDC_JWKS_ENDPOINT || '/oidc/keys',
    },
  },
};

function buildOidcScopes() {
  const scopesCommaSeparated = process.env.OIDC_SCOPES || 'openid';
  return scopesCommaSeparated.split(',').map((s) => s.trim()); // ['openid', 'email', 'profile']
}
