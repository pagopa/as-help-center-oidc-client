import app from './app';
import config from '@config/env';

// start server for local development
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`Server running on ${config.server.host}`);
});
