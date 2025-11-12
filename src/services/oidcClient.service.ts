import { CallbackParamsType, Client, Issuer } from 'openid-client';
import config from '@config/env';
import { Request } from 'express';
import { CallbackReqParam } from '@dtos/auth/callback.dto';
import { ExchangedTokenSet } from 'src/types/auth.types';
import { validateRequiredFields } from '@utils/utils';

let client: Client | null = null;

// initialize and get oidc client
export function initializeClient() {
  try {
    if (!client) {
      // Client Discovery: async - it require a different init and get client approach
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
  } catch (error) {
    console.error('OIDC Client initialization failed:', error);
    throw error;
  }
}

export function getClientOrThrow(): Client {
  if (!client) throw new Error('OIDC client not initialized.');
  return client;
}

// generate oidc authorize url
export function generateAuthUrl(state: string, nonce: string, additionalParams: Record<string, any> = {}): string {
  const client = getClientOrThrow();
  return client.authorizationUrl({
    scope: config.oidc.scopes.join(' '),
    state,
    nonce,
    response_type: config.oidc.responseType,
    ...additionalParams,
  });
}

// handle callback and exchange auth code with tokens
export async function handleCallback(
  callbackParams: CallbackParamsType,
  checks: { state?: string; nonce?: string },
): Promise<ExchangedTokenSet> {
  const client = getClientOrThrow();
  const tokenSet = await client.callback(config.server.clientRedirectUri, callbackParams, checks);

  const claims = tokenSet.claims();
  // validate claims required fields
  validateRequiredFields(claims, ['nonce', 'name', 'familyName', 'fiscalNumber'], 'Missing required token claims');

  return {
    idToken: tokenSet.id_token,
    claims,
  };
}

// extract callback params from request
export function extractCallbackParams(req: Request<{}, {}, {}, CallbackReqParam>): CallbackParamsType {
  const client = getClientOrThrow();
  return client.callbackParams(req);
}

// verify if client oidc is initialized
export function isInitialized(): boolean {
  return !!client;
}
