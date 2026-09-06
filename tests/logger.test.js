const logger = require('../middlewares/logger');

describe('Logger Middleware', () => {
  test('logger exposes winston-style methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  test('logger middleware is a function', () => {
    expect(typeof logger.requestLogger).toBe('function');
  });
});

