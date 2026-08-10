require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.error('SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD are required in .env');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingByUsername = await User.findOne({ username });
  const existingByEmail = await User.findOne({ email: email.toLowerCase() });

  if (existingByUsername || existingByEmail) {
    console.log('Admin seed skipped: a user with that username or email already exists.');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: ROLES.ADMIN
  });

  console.log(`Admin user "${username}" created successfully.`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error('Failed to seed admin:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore disconnect errors
  }
  process.exit(1);
});
