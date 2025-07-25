import express from 'express';
import * as securityCheckManager from '@services/oidcSecurityCheck.service';
import * as oidcClient from '@services/oidcClient.service';
import { requireOIDC } from '@middlewares/requireOIDC';
import * as JwtAuthService from '@services/jwtAuth.service';
import config from '@config/env';
import { loginFormAutoSubmit, logoutRedirect } from 'src/utils/zendeskRedirect';
import { getErrorPageFromReturnTo, sanitizedReturnTo } from 'src/utils/brandUtils';
import { sanitizeLogMessage } from 'src/utils/utils';

const authRouter = express.Router();

// TODO: add controllers

// Login endpoint -> to init oidc flow
authRouter.get('/login', requireOIDC(), (req, res) => {
  try {
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
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login initialization failed',
    });
  }
});

// Callback endpoint
authRouter.get('/callback', requireOIDC(), async (req, res) => {
  try {
    // TODO: if qp contains return_to, zendesk_redirect, or client_id -> check it to prevent client usage from other platforms
    console.log('qp callback:', req.query);
    const params = oidcClient.extractCallbackParams(req);
    const { state, code, error, error_description } = params;

    // Manage provider errors
    if (error) {
      console.error('OIDC Provider error:', error, error_description);
      res.status(400).json({
        error: 'Authorization failed',
      });
    }

    if (!code) {
      res.status(400).json({ error: 'Missing code required parameters' });
    }

    // Validate state
    let statePayload;
    try {
      statePayload = securityCheckManager.validateAndGetState(state);
    } catch (stateError: unknown) {
      console.error('State validation error:', stateError);
      res.status(400).json({ error: 'State validation error' });
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
      res.status(400).json({ error: 'Nonce validation error' });
    }

    console.log(`Login completed for user: ${claims.email}`);

    const jwtAccess = JwtAuthService.generateAuthJwt(
      `${claims.name} ${claims.familyName}`,
      claims.fiscalNumber as string | undefined,
      '_users_hc_cac', // TODO: what we need to include
      statePayload?.contact_email,
    );
    res.send(loginFormAutoSubmit(config.authJwt.loginActionEndpoint, jwtAccess, statePayload?.return_to_url));
  } catch (error: unknown) {
    console.error('Callback error:', error);
    res.status(500).json({
      error: 'Login completion failed',
    });
  }
});

// logout endpoint
authRouter.get('/logout', (req, res) => {
  if (req.query.kind === 'error') {
    console.error(`Logout error: "${sanitizeLogMessage(req.query.message)}"`);
    res.redirect(getErrorPageFromReturnTo(req.query.return_to as string));
    return;
  }
  res.send(logoutRedirect(sanitizedReturnTo(req.query.return_to as string)));
});

export { authRouter, oidcClient };
