import * as securityCheckManager from '@services/oidcSecurityCheck.service';
import * as oidcClient from '@services/oidcClient.service';
import * as JwtAuthService from '@services/jwtAuth.service';
import config from '@config/env';
import { loginFormAutoSubmit } from '@utils/zendeskRedirect';
import { ApiError } from '@errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { AccessTokenClaims, AuthSessionRecord } from 'src/types/auth.types';
import { CallbackParamsType } from 'openid-client';
import { sanitizedReturnTo } from '@utils/brandUtils';
import { validateEmailDomain } from '@utils/utils';
import { ERROR_CODES } from '@utils/constants';

export const generateAuthenticationUrlForLogin = async (returnTo: string, contactEmail: string): Promise<string> => {
  const isEmailDomainValid = await validateEmailDomain(contactEmail);
  if (!isEmailDomainValid) {
    throw new ApiError('Invalid or unreachable email domain', StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_EMAIL);
  }

  // generate state and nonce, and save to DynamoDB
  const { state, nonce } = await securityCheckManager.createStateAndNonce({
    return_to_url: returnTo,
    contact_email: contactEmail,
  });
  // generate authUrl
  return oidcClient.generateAuthUrl(state, nonce);
};

export const handleLoginCallbackAndGenerateAutoSubmitForm = async (callbackParams: CallbackParamsType) => {
  const { state, code, error, error_description } = callbackParams;

  // Manage provider errors
  if (error) {
    console.error('OIDC Provider error:', error, error_description);
    throw new ApiError('Authorization failed', StatusCodes.BAD_REQUEST, ERROR_CODES.PROVIDER_ERROR);
  }

  if (!code) {
    throw new ApiError('Missing code required parameters', StatusCodes.BAD_REQUEST, ERROR_CODES.AUTH_ERROR);
  }

  // Validate state and retrieve auth session record
  let authSessionRecord: AuthSessionRecord;
  try {
    authSessionRecord = await securityCheckManager.validateStateAndGetAuthSession(state);
  } catch (stateError) {
    console.error('State validation error:', stateError);
    throw new ApiError('State validation error', StatusCodes.BAD_REQUEST, ERROR_CODES.AUTH_ERROR);
  }

  // Exchange code with tokens
  let claims: AccessTokenClaims;
  try {
    const tokenSet = await oidcClient.handleCallback(callbackParams, {
      state: state!,
      nonce: authSessionRecord.nonce,
    });
    claims = tokenSet.claims;
  } catch (tokenExchangeError) {
    console.error('Token exchange error:', tokenExchangeError);
    throw new ApiError('Token exchange error', StatusCodes.BAD_REQUEST, ERROR_CODES.AUTH_ERROR);
  }

  // Additional nonce validation (optional, it should be already done from openid-client lib)
  try {
    securityCheckManager.validateNonce(authSessionRecord.nonce, claims.nonce);
  } catch (nonceError) {
    console.error('Nonce validation error:', nonceError);
    throw new ApiError('Nonce validation error', StatusCodes.BAD_REQUEST, ERROR_CODES.AUTH_ERROR);
  }

  // generate zendesk jwt
  const jwtAccess = JwtAuthService.generateAuthJwt(
    `${claims.name} ${claims.familyName}`,
    config.authJwt.jwtTokenOrganizationClaim,
    authSessionRecord.contact_email,
    claims.fiscalNumber,
  );

  // generate login form auto submit HTML
  return loginFormAutoSubmit(
    config.authJwt.loginActionEndpoint,
    jwtAccess,
    sanitizedReturnTo(authSessionRecord.return_to_url),
  );
};
