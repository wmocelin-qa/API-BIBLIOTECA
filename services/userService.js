const users = require('../models/users');
const bcrypt = require('bcryptjs');
let userIdCounter = 1;

function createUser(username, password) {
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    throw new Error('Usuário e senha não podem ser nulos ou em branco');
  }
  if (users.find(u => u.username === username)) {
    throw new Error('Usuário já cadastrado');
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = { id: userIdCounter++, username, password: hashedPassword };
  users.push(user);
  return user;
}

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function getUserById(id) {
  return users.find(u => u.id === id);
}

function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

module.exports = { createUser, findUserByUsername, getUserById, users, comparePassword };
