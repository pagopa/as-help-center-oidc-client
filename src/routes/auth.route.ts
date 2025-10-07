import { Router } from 'express';
import { requireOIDC } from '@middlewares/requireOIDC';
import * as authController from '@controllers/auth.controller';

const router = Router();
const prefix = '/auth';

// Login endpoint -> to init oidc flow
router.get('/login', requireOIDC(), authController.login);

// Callback endpoint
router.get('/callback', requireOIDC(), authController.callback);

// logout endpoint
router.get('/logout', authController.logout);

export default { router, prefix };
