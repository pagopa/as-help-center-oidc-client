import config from '@config/env';
import express from 'express';
import healthRouter from './health.route';
import authRouter from '@routes/auth.route';
import { NODE_ENV_VALUES } from '@utils/constants';
// import apiDocsRoute after any other route files to ensure all routes are registered before Swagger docs are generated
import apiDocsRoute from './apidocs.route';

const expressRouter = express.Router();

const routes = [
  {
    path: healthRouter.prefix,
    router: healthRouter.router,
  },
  {
    path: authRouter.prefix,
    router: authRouter.router,
  },
];

routes.forEach((route) => {
  expressRouter.use(route.path, route.router);
});

// routes available only in development mode
const devRoutes = [
  {
    path: apiDocsRoute.prefix,
    router: apiDocsRoute.router,
  },
];

if (config.server.environment === NODE_ENV_VALUES.local) {
  devRoutes.forEach((route) => {
    expressRouter.use(route.path, route.router);
  });
}

export default expressRouter;
