import { Request, Response } from 'express';
import * as securityCheckManager from '@services/oidcSecurityCheck.service';
import * as oidcClient from '@services/oidcClient.service';
import * as JwtAuthService from '@services/jwtAuth.service';
import config from '@config/env';
import { loginFormAutoSubmit } from '@utils/zendeskRedirect';
import { getErrorPageFromBrandId, sanitizedReturnTo } from '@utils/brandUtils';
import { sanitizeLogMessage } from '@utils/utils';
import { ApiError } from '@errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { LogoutReqParam } from '@dtos/auth/logout.dto';
import { LoginReqParam } from '@dtos/auth/login.dto';
import { CallbackReqParam } from '@dtos/auth/callback.dto';
import { AccessTokenClaims, StateJwtPayload } from 'src/types/auth.types';

export const login = async (req: Request<{}, {}, {}, LoginReqParam>, res: Response) => {
  const { return_to, contact_email } = req.query;

  // generate state and nonce
  const { state, nonce } = securityCheckManager.createStateAndNonce({
    return_to_url: return_to,
    contact_email: contact_email,
  });
  // generate authUrl
  const authUrl = oidcClient.generateAuthUrl(state, nonce);
  // redirect fe to generated authUrl
  res.redirect(authUrl);
};

export const callback = async (req: Request<{}, {}, {}, CallbackReqParam>, res: Response) => {
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
  let statePayload: StateJwtPayload;
  try {
    statePayload = securityCheckManager.validateAndGetState(state);
  } catch (stateError) {
    console.error('State validation error:', stateError);
    throw new ApiError('State validation error', StatusCodes.BAD_REQUEST);
  }

  // Exchange code with tokens
  let claims: AccessTokenClaims;
  try {
    const tokenSet = await oidcClient.handleCallback(params, {
      state,
      nonce: statePayload?.nonce,
    });
    claims = tokenSet.claims;
  } catch (tokenExchangeError) {
    console.error('Token exchange error:', tokenExchangeError);
    throw new ApiError('Token exchange error', StatusCodes.BAD_REQUEST);
  }

  // Additional nonce validation (optional, it should be already done from openid-client lib)
  try {
    securityCheckManager.validateNonce(statePayload?.nonce, claims.nonce);
  } catch (nonceError) {
    console.error('Nonce validation error:', nonceError);
    throw new ApiError('Nonce validation error', StatusCodes.BAD_REQUEST);
  }

  // generate zendesk jwt
  const jwtAccess = JwtAuthService.generateAuthJwt(
    `${claims.name} ${claims.familyName}`,
    claims.fiscalNumber,
    config.authJwt.jwtTokenOrganizationClaim,
    statePayload?.contact_email,
  );
  res.send(loginFormAutoSubmit(config.authJwt.loginActionEndpoint, jwtAccess, statePayload?.return_to_url));
};

export const logout = async (req: Request<{}, {}, {}, LogoutReqParam>, res: Response) => {
  if (req.query.kind === 'error') {
    // in case of Zendesk error while processing a JWT login request (such as clock drifts, rate limits being hit, and invalid tokens), it redirects to logout URL and passes a message and a kind (error) parameter. Most of the errors that can happen are ones that you'll want to fix.
    console.error({
      event: 'zendesk_login_error',
      brand_id: req.query.brand_id,
      message: sanitizeLogMessage(req.query.message),
    });
    // simply logout and redirect to the return_to parameter if specified or a generic return_to
    res.redirect(getErrorPageFromBrandId(req.query.return_to));
    return;
  }
  res.redirect(sanitizedReturnTo(req.query.return_to));
};
