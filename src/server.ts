import app from './app';
import config from '@config/env';
import { log } from '@utils/logger';

// start server for local development
const PORT = config.server.port;

app.listen(PORT, () => {
  log.info(`Server running on ${config.server.host}`);
});
