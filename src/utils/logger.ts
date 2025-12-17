import pino from 'pino';
import config from '@config/env';
import { NODE_ENV_VALUES } from './constants';

const getLogLevel = (): pino.LevelWithSilent => {
  const env = config.server.environment;
  if (env === NODE_ENV_VALUES.production) {
    return 'info';
  }
  return 'debug';
};

export const logger = pino({
  level: getLogLevel(),
  // JSON level format for cloudwatch
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  // Timestamp ISO 8601
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  // pretty print for local development only
  ...(config.server.environment === NODE_ENV_VALUES.local && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

let loggerMetadata: Record<string, unknown> = {};

export let log: pino.Logger = logger.child(loggerMetadata);

export function addLogMetadata({ metadata }: { metadata: Record<string, unknown> }) {
  const newLogMetadata = {
    ...loggerMetadata,
    ...metadata,
  };
  log = logger.child(newLogMetadata);
  loggerMetadata = newLogMetadata;
}
