const User = require('../models/User');

describe('User Model', () => {
  test('user schema includes email field', () => {
    expect(User.schema.obj.email).toBeDefined();
    expect(User.schema.obj.email.required).toBe(true);
    expect(User.schema.obj.email.unique).toBe(true);
  });

  test('user schema includes soft-delete status', () => {
    expect(User.schema.obj.status).toBeDefined();
    expect(User.schema.obj.deletedAt).toBeDefined();
  });

  test('toJSON strips password property from user object', () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password_123'
    });
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.username).toBe('testuser');
    expect(json.email).toBe('test@example.com');
  });
});


