require('dotenv').config({ path: 'tests/.env.test' });

// Mock pino logger when JEST_SILENT is true to suppress logs during tests
if (process.env.JEST_SILENT === 'true') {
  jest.mock('@utils/logger', () => ({
    log: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    },
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
      })),
    },
    addLogMetadata: jest.fn(),
  }));
}
