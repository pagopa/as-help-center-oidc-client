import { Client, Issuer } from 'openid-client';
import config from '@config/env';
import { Request } from 'express';

let client: Client;

// initialize and get oidc client
export function getClientOrInitialize() {
  try {
    if (!client) {
      // TODO: discover? with oneid we will have only issuer with discovery or all endpoints?
      // const issuer = await Issuer.discover(process.env.OIDC_ISSUER);
      const issuer = new Issuer({
        issuer: config.oidc.issuer,
        authorization_endpoint: config.oidc.issuer + config.oidc.endpoints.authorize,
        token_endpoint: config.oidc.issuer + config.oidc.endpoints.token,
        jwks_uri: config.oidc.issuer + config.oidc.endpoints.jwks,
      });
      client = new issuer.Client({
        client_id: config.oidc.clientId,
        client_secret: config.oidc.clientSecret,
        redirect_uris: [config.server.clientRedirectUri],
        response_types: ['code'],
      });

      console.log('OIDC Client initialized successfully');
    }
    return client;
  } catch (error) {
    console.error('OIDC Client initialization failed:', error);
    throw error;
  }
}

// generate oidc authorize url
export function generateAuthUrl(state: string, nonce: string, additionalParams: Record<string, any> = {}) {
  // const client = getClientOrInitialize();
  return client.authorizationUrl({
    scope: config.oidc.scopes.join(' '),
    state,
    nonce,
    response_type: 'code',
    ...additionalParams,
  });
}

// handle callback and exchange auth code with tokens
// TODO dare il tipo a claims
export async function handleCallback(callbackParams: Record<string, any>, checks: { state?: string; nonce?: string }) {
  try {
    // const client = getClientOrInitialize();
    const tokenSet = await client.callback(config.server.clientRedirectUri, callbackParams, checks);

    return {
      idToken: tokenSet.id_token,
      claims: tokenSet.claims(),
    };
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
}

// extract callback params from request
export function extractCallbackParams(req: Request) {
  // const client = getClientOrInitialize();
  return client.callbackParams(req);
}

// verify if client oidc is initialized
export function isInitialized() {
  return !!client;
}
