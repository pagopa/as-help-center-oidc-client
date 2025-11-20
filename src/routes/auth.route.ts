import { Router } from 'express';
import { requireOIDC } from '@middlewares/requireOIDC';
import * as authController from '@controllers/auth.controller';
import { validate } from '@middlewares/validateApiInput';
import { loginOpenApiRedirectResponse, loginReqOriginalParamsSchema, loginReqParamSchema } from '@dtos/auth/login.dto';
import { callbackOpenApiHtmlResponse, callbackReqParamSchema } from '@dtos/auth/callback.dto';
import { logoutOpenApiRedirectResponse, logoutReqParamSchema } from '@dtos/auth/logout.dto';
import { registerRoute } from '@utils/openapi';
import { StatusCodes } from 'http-status-codes';

const router = Router();
const prefix = '/auth';
const tag = 'Authentication';

// Login endpoint -> to init oidc flow
router.get('/login', requireOIDC(), validate({ query: loginReqParamSchema }), authController.login);
registerRoute({
  method: 'get',
  path: `${prefix}/login`,
  summary: 'Start OIDC login flow and redirect to OIDC provider login page',
  tags: [tag],
  queryParams: loginReqOriginalParamsSchema,
  responses: {
    [StatusCodes.MOVED_TEMPORARILY]: loginOpenApiRedirectResponse,
  },
  errorsRedirect: true,
});

// Callback endpoint
router.get('/callback', requireOIDC(), validate({ query: callbackReqParamSchema }), authController.callback);
registerRoute({
  method: 'get',
  path: `${prefix}/callback`,
  summary: 'Handle OIDC callback and effectuate login',
  tags: [tag],
  queryParams: callbackReqParamSchema,
  responses: {
    [StatusCodes.OK]: callbackOpenApiHtmlResponse,
  },
  errorsRedirect: true,
});

// logout endpoint
router.get('/logout', validate({ query: logoutReqParamSchema }), authController.logout);
registerRoute({
  method: 'get',
  path: `${prefix}/logout`,
  summary: 'Logout and redirect to return_to URL',
  tags: [tag],
  queryParams: logoutReqParamSchema,
  responses: {
    [StatusCodes.MOVED_TEMPORARILY]: logoutOpenApiRedirectResponse,
  },
  errorsRedirect: true,
});

export default { router, prefix };
