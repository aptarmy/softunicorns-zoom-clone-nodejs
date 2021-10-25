require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const model = require('./models');
const { verify } = require('./helpers/google-oauth-2');
const { generateToken, verifyToken } = require('./helpers/jwt');
const models = require('./models');

const { Server } = require('socket.io');

const io = new Server(server, {
	serveClient: false,
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST', 'OPTIONS']
	}
});
io.on('connection', (socket) => {
	console.log('socket connected ID:', socket.id);
});


app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/login', async (req, res, next) => {
	console.log('Got body:', req.body);
	const { idToken } = req.body;
	let payload;
	try {
		payload = await verify(idToken);
	} catch(error) {
		console.log(error);
		return next({ status: 401, error: error.message || 'id_token is invalid' });
	}
	console.log(payload);
	let user = await model.user.findOne({ where: { email: payload.email }, raw: true });
	if(!user) { user = await model.user.create({ fName: payload.given_name, lName: payload.family_name, email: payload.email, imgUrl: payload.picture }).then(userModel => userModel.get({ plain: true })); }
	const { createdAt, updatedAt, ...userPlain } = user;
	const token = generateToken({ id: user.id, email: user.email });
	res.json({ ...userPlain, token });
});
app.post('/verify', (req, res, next) => {
	const { idToken } = req.body;
	let decoded;
	try {
		decoded = verifyToken(idToken);
	} catch(error) {
		return next({ status: 401, error: error.message });
	}
	res.json(decoded);
});
app.use((error, req, res, next) => {
	res.status(error.status || 500).json(error);
});

server.listen(8080, () => {
	console.log('Listening on port 8080');
});