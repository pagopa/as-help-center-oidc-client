import { Request, Response } from 'express';
import * as securityCheckManager from '@services/oidcSecurityCheck.service';
import * as oidcClient from '@services/oidcClient.service';
import * as JwtAuthService from '@services/jwtAuth.service';
import config from '@config/env';
import { loginFormAutoSubmit, logoutRedirect } from '@utils/zendeskRedirect';
import { getErrorPageFromReturnTo, sanitizedReturnTo } from '@utils/brandUtils';
import { sanitizeLogMessage } from '@utils/utils';
import { ApiError } from '@errors/ApiError';
import { StatusCodes } from 'http-status-codes';

export const login = async (req: Request, res: Response) => {
  console.log('qp login:', req.query);

  // TODO add zod
  const return_to = new URL(req.query.return_to as string);
  const emailContact = return_to.searchParams.get('contact_email');
  return_to.searchParams.delete('contact_email');

  const { state, nonce } = securityCheckManager.createStateAndNonce({
    return_to_url: return_to.toString(),
    contact_email: emailContact!,
  });
  const authUrl = oidcClient.generateAuthUrl(state, nonce);

  console.log('Redirect to:', authUrl);
  res.redirect(authUrl);
};

export const callback = async (req: Request, res: Response) => {
  // TODO: if qp contains return_to, zendesk_redirect, or client_id -> check it to prevent client usage from other platforms
  console.log('qp callback:', req.query);
  const params = oidcClient.extractCallbackParams(req);
  const { state, code, error, error_description } = params;

  // Manage provider errors
  if (error) {
    console.error('OIDC Provider error:', error, error_description);
    throw new ApiError('Authorization failed', StatusCodes.BAD_REQUEST);
  }

  if (!code) {
    throw new ApiError('Missing code required parameters', StatusCodes.BAD_REQUEST);
  }

  // Validate state
  let statePayload;
  try {
    statePayload = securityCheckManager.validateAndGetState(state);
  } catch (stateError: unknown) {
    console.error('State validation error:', stateError);
    throw new ApiError('State validation error', StatusCodes.BAD_REQUEST);
  }

  // Exchange code with tokens
  const { claims } = await oidcClient.handleCallback(params, {
    state,
    nonce: statePayload?.nonce,
  });

  console.log(statePayload?.contact_email, statePayload?.return_to_url);

  // Additional nonce validation (optional, it was already done from openid-client lib -> to verify)
  try {
    securityCheckManager.validateNonce(statePayload?.nonce, claims.nonce);
  } catch (nonceError: unknown) {
    console.error('Nonce validation error:', nonceError);
    throw new ApiError('Nonce validation error', StatusCodes.BAD_REQUEST);
  }

  console.log(`Login completed for user: ${claims.email}`);

  const jwtAccess = JwtAuthService.generateAuthJwt(
    `${claims.name} ${claims.familyName}`,
    claims.fiscalNumber as string | undefined,
    '_users_hc_cac', // TODO: what we need to include
    statePayload?.contact_email,
  );
  res.send(loginFormAutoSubmit(config.authJwt.loginActionEndpoint, jwtAccess, statePayload?.return_to_url));
};

export const logout = async (req: Request, res: Response) => {
  if (req.query.kind === 'error') {
    console.error(`Zendesk JWT error: "${sanitizeLogMessage(req.query.message)}"`);
    // TODO: simply logout and return to home or specific error page for auth error and not generic error page?
    // TODO: is return to available in case of kind error ?
    res.redirect(getErrorPageFromReturnTo(req.query.return_to as string));
    return;
  }
  // TODO: is autosubmit needed? or can we use res.redirect?
  // res.redirect(sanitizedReturnTo(req.query.return_to as string));
  res.send(logoutRedirect(sanitizedReturnTo(req.query.return_to as string)));
};
