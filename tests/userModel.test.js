const test = require('node:test');
const assert = require('node:assert/strict');

const User = require('../models/User');

test('user schema includes email field', () => {
  assert.ok(User.schema.obj.email, 'email field should exist on user model');
  assert.equal(User.schema.obj.email.required, true);
  assert.equal(User.schema.obj.email.unique, true);
});
