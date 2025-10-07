import express from 'express';
import healthRouter from './health.route';
import authRouter from '@routes/auth.route';

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

export default expressRouter;
