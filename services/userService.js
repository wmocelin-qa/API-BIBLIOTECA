const users = require('../models/users');
const bcrypt = require('bcryptjs');

// Initialize id counter from existing users to avoid collisions
let userIdCounter = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
// Fast username lookup to avoid O(n) scans
const usernameIndex = new Map(users.map(u => [u.username, u]));
// Locks to prevent concurrent registration for the same username
const registrationLocks = new Set();

async function createUser(username, password) {
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    throw new Error('Usuário e senha não podem ser nulos ou em branco');
  }

  if (usernameIndex.has(username)) {
    throw new Error('Usuário já cadastrado');
  }

  if (registrationLocks.has(username)) {
    // Signal that registration for this username is already in progress
    throw new Error('Registro em processamento');
  }

  registrationLocks.add(username);
  try {
    // Use async bcrypt to avoid blocking the event loop under load
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = { id: userIdCounter++, username, password: hashedPassword };
    users.push(user);
    usernameIndex.set(username, user);
    return user;
  } finally {
    registrationLocks.delete(username);
  }
}

function findUserByUsername(username) {
  return usernameIndex.get(username) || users.find(u => u.username === username);
}

function getUserById(id) {
  return users.find(u => u.id === id);
}

function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

module.exports = { createUser, findUserByUsername, getUserById, users, comparePassword };
