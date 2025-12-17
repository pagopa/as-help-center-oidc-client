import { Request, Response } from 'express';
import * as oidcClient from '@services/oidcClient.service';
import { log } from '@utils/logger';
import { getErrorPageFromBrandId, sanitizedReturnTo } from '@utils/brandUtils';
import { hashPII, sanitizeLogMessage } from '@utils/utils';
import { LogoutReqParam } from '@dtos/auth/logout.dto';
import { LoginReqParam } from '@dtos/auth/login.dto';
import { CallbackReqParam } from '@dtos/auth/callback.dto';
import * as authService from '@services/auth.service';

export const login = async (req: Request<{}, {}, {}, LoginReqParam>, res: Response) => {
  const { return_to, contact_email, brand_id } = req.query;
  log.info(
    {
      emailHash: hashPII(contact_email),
      brandId: brand_id,
    },
    'Login request',
  );
  // generate authUrl
  const authUrl = await authService.generateAuthenticationUrlForLogin(return_to, contact_email);

  // redirect fe to generated authUrl
  res.redirect(authUrl);
};

export const callback = async (req: Request<{}, {}, {}, CallbackReqParam>, res: Response) => {
  // extract callback request params
  const params = oidcClient.extractCallbackParams(req);
  // handle login callback and generate login auto submit form
  const loginFormAutoSubmit = await authService.handleLoginCallbackAndGenerateAutoSubmitForm(params);

  res.send(loginFormAutoSubmit);
};

export const logout = async (req: Request<{}, {}, {}, LogoutReqParam>, res: Response) => {
  if (req.query.kind === 'error') {
    // in case of Zendesk error while processing a JWT login request (such as clock drifts, rate limits being hit, and invalid tokens), it redirects to logout URL and passes a message and a kind (error) parameter. Most of the errors that can happen are ones that you'll want to fix.
    log.error(
      {
        brand_id: req.query.brand_id,
        message: sanitizeLogMessage(req.query.message),
      },
      'Zendesk login error during logout',
    );
    // simply logout and redirect to the return_to parameter if specified or a generic return_to
    res.redirect(getErrorPageFromBrandId(req.query.return_to));
  } else {
    res.redirect(sanitizedReturnTo(req.query.return_to));
  }
};
