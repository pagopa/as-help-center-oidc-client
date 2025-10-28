import { Router } from 'express';
import { requireOIDC } from '@middlewares/requireOIDC';
import * as authController from '@controllers/auth.controller';
import { validate } from '@middlewares/validateApiInput';
import { loginReqParamSchema } from '@dtos/auth/login.dto';
import { callbackReqParamSchema } from '@dtos/auth/callback.dto';
import { logoutReqParamSchema } from '@dtos/auth/logout.dto';

const router = Router();
const prefix = '/auth';

// Login endpoint -> to init oidc flow
router.get('/login', requireOIDC(), validate({ query: loginReqParamSchema }), authController.login);

// Callback endpoint
router.get('/callback', requireOIDC(), validate({ query: callbackReqParamSchema }), authController.callback);

// logout endpoint
router.get('/logout', validate({ query: logoutReqParamSchema }), authController.logout);

export default { router, prefix };
