const bcrypt = require('bcryptjs');

const users = [{
    id: 1,
    username: 'juninho',
    password: bcrypt.hashSync('1234', 8)
},
{
    id: 2,
    username: 'gisele',
    password: bcrypt.hashSync('1234', 8)
},
{
    id: 3,
    username: 'lizie',
    password: bcrypt.hashSync('1234', 8)
}];

module.exports = users;