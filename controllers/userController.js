
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = 'biblioteca_secret';

async function register(req, res) {
  try {
    const { username, password } = req.body;
    const user = await userService.createUser(username, password);
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    if (err && err.message === 'Registro em processamento') {
      return res.status(409).json({ error: 'Registro em processamento, tente novamente' });
    }
    if (err && (err.message === 'Usuário já cadastrado' || err.message === 'Usuário e senha não podem ser nulos ou em branco')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Erro ao registrar usuário' });
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
