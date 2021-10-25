require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = obj => jwt.sign(obj, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '6h' });
const verifyToken = token => jwt.verify(token, process.env.JWT_SECRET, { algorithm: 'HS256' });

module.exports = { generateToken, verifyToken };
