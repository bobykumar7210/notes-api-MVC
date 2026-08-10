const test = require('node:test');
const assert = require('node:assert/strict');

const logger = require('../middlewares/logger');

test('logger exposes winston-style methods', () => {
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.error, 'function');
  assert.equal(typeof logger.warn, 'function');
});

test('logger middleware is a function', () => {
  assert.equal(typeof logger.requestLogger, 'function');
});
