
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = 'biblioteca_secret';

function register(req, res) {
  try {
    const { username, password } = req.body;
    const user = userService.createUser(username, password);
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

function login(req, res) {
  const { username, password } = req.body;
  const user = userService.findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1h' });
  res.json({ token });
}

function listUsers(req, res) {
  const users = userService.users;
  res.json(users);
}

module.exports = { register, login, listUsers };
