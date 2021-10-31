require('dotenv').config();
const chalk = require('chalk');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const model = require('./models');
const { v4: uuid } = require('uuid');
const { verify } = require('./helpers/google-oauth-2');
const { generateToken, verifyToken } = require('./helpers/jwt');
const authMiddleware = require('./middlewares/auth');
const models = require('./models');

const { Server } = require('socket.io');

const corsConfig = {
	origin: true,
	methods: ['GET', 'POST', 'OPTIONS']
};
const io = new Server(server, {
	serveClient: false,
	cors: corsConfig
});
io.use(async (socket, next) => {
	const { token } = socket.handshake.auth;
	const { roomSlug } = socket.handshake.query;
	if(!token) { next(new Error('token is required')) }
	if(!roomSlug) { next(new Error('roomSlug is required')) }
	let payload, room, user, roomUser;
	try {
		payload = verifyToken(token);
	} catch(error) {
		console.log(error);
		return next(error);
	}
	try {
		room = await models.room.findOne({ where: { slug: roomSlug }, attributes: ['id', 'ownerId'] });
		if(!room) { return next(new Error(`Room slug not found: ${roomSlug}`)) }
		user = await models.user.findOne({ where: { id: payload.id }, attributes: ['id', 'email'] });
		if(!user) { return next(new Error(`Sser not found id: ${payload.id}`)) }
		roomUser = await models.room_user.findOne({ where: { roomId: room.id, userId: user.id }, attributes: ['id'] });
		if(!roomUser) { roomUser = await models.room_user.create({ roomId: room.id, userId: user.id, admitted: room.ownerId === user.id }); }
	} catch(error) {
		console.error(error);
		return next(error);
	}
	socket.userId = payload.id;
	socket.userEmail = payload.email;
	socket.roomId = room.id;
	socket.roomUserId = roomUser.id;
	socket.roomOwnerId = room.ownerId;
	socket.roomSlug = roomSlug;
	next();
});
io.on('connection', async socket => {
	console.log(`${chalk.green('connected socketID')}: ${socket.id}`);
	console.log(`${chalk.green('token')}: ${socket.handshake.auth.token}`);
	console.log(`${chalk.green('roomSlug')}: ${socket.handshake.query.roomSlug}`);
	// join socket with roomSlug
	socket.join(socket.roomSlug);
	// update user socket in db
	models.room_user_socket.create({ roomUserId: socket.roomUserId, userId: socket.userId, socketId: socket.id })
		.then(roomUserSocket => {
			socket.roomUserSocketId = roomUserSocket.id;
			// notify participants in the room that new user joined
			models.user.findOne({ where: { id: socket.userId }, attributes: ['id', 'fName', 'lName', 'email', 'imgUrl'], include: { model: models.room_user, where: { roomId: socket.roomId }, attributes: ['id', 'admitted'], include: { model: models.room_user_socket, attributes: ['socketId'], as: 'sockets' } } })
				.then(user => {
					io.to(socket.roomSlug).emit('user-joined', user, socket.id);
				});
		})
		.catch(err => console.error(err));
	socket.on('user-admitted', async userId => {
		try {
			const roomUser = await models.room_user.findOne({ where: { userId, roomId: socket.roomId } });
			roomUser.admitted = true;
			await roomUser.save();
			const roomUserSockets = await models.room_user_socket.findAll({ where: { userId: userId }, include: { model: models.room_user, where: { roomId: socket.roomId } } });
			const sockets = roomUserSockets.map(s => s.socketId);
			sockets.forEach(s => io.to(s).emit('admitted-to-room'));
			io.to(socket.roomSlug).emit('user-admitted', userId);
		} catch(error) { console.error(error) }
	});
	socket.on('webrtc-signaling', async ({ toSocketId, candidate, description }) => {
		if(!candidate && !description) { return console.log('candidate or description is required') }
		io.to(toSocketId).emit('webrtc-signaling', { fromSocketId: socket.id, [candidate ? 'candidate' : 'description']: candidate || description });
	});
	socket.on('disconnect', async () => {
		console.log('socket disconnected: ', socket.id);
		// remove socketId
		if(socket.roomUserSocketId !== undefined) {
			models.room_user_socket.destroy({ where: { id: socket.roomUserSocketId } })
				.then(() => {
					// notify participants in the room that new user joined
					models.user.findOne({ where: { id: socket.userId }, attributes: ['id', 'fName', 'lName', 'email', 'imgUrl'], include: { model: models.room_user, where: { roomId: socket.roomId }, attributes: ['id', 'admitted'], include: { model: models.room_user_socket, attributes: ['socketId'], as: 'sockets' } } })
					.then(user => {
						io.to(socket.roomSlug).emit('user-left', user, socket.id);
					});
				})
				.catch(err => console.error(err));
		}
		// remove room if the host leave
		// if(socket.userId === socket.roomOwnerId) {
		// 	// notify participants to leave the room
		// 	io.to(socket.roomSlug).emit('host-left');
		// 	models.room.destroy({ where: { id: socket.roomId } })
		// 		.catch(err => console.error(err));
		// }
	});
});

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/login', async (req, res, next) => {
	const { idToken } = req.body;
	let payload, user;
	try {
		payload = await verify(idToken);
	} catch(error) {
		console.log(error);
		return next({ status: 401, error: error.message || 'id_token is invalid' });
	}
	try {
		user = await model.user.findOne({ where: { email: payload.email }, raw: true });
		if(!user) { user = await model.user.create({ fName: payload.given_name, lName: payload.family_name, email: payload.email, imgUrl: payload.picture }).then(userModel => userModel.get({ plain: true })); }
	} catch(error) {
		return next({ status: 500, error: error.message, original: error.original });
	}
	const { createdAt, updatedAt, ...userPlain } = user;
	const token = generateToken({ id: user.id, email: user.email });
	res.json({ ...userPlain, token });
});
app.get('/room/:roomSlug', authMiddleware, async (req, res, next) => {
	const roomSlug = req.params.roomSlug;
	const userId = req.userId;
	let room, participants;
	try {
		// get room
		room = await models.room.findOne({ where: { slug: roomSlug } });
		// check permission
		const userRoom = await models.room_user.findOne({ where: { roomId: room.id, userId: userId } });
		if(!userRoom.admitted) {
			// notify host to admit the user
			const roomOwnerSocketIds = await models.room_user_socket.findAll({ where: { userId: room.ownerId }, attributes: ['socketId'], include: { model: models.room_user, where: { roomId: room.id } } });
			const user = await models.user.findOne({ where: { id: userId }, attributes: [ 'id', 'fName', 'lName', 'email', 'imgUrl' ] });
			const userSockets = await models.room_user_socket.findAll({ where: { userId: userId }, attributes: ['socketId'], include: { model: models.room_user, where: { roomId: room.id } } });
			roomOwnerSocketIds.forEach(socket => io.to(socket.socketId).emit('user-to-admit', { ...user.get({ plain: true }), sockets: userSockets.map(s => s.socketId) }));
			return next({ status: 200, error: 'You have not been admitted to the room yet.' });
		}
		// get participants
		participants = await models.user.findAll({ attributes: ['id', 'fName', 'lName', 'email', 'imgUrl'], include: { model: models.room_user, where: { roomId: room.id }, attributes: ['id', 'admitted'], include: { model: models.room_user_socket, attributes: ['socketId'], as: 'sockets' } } });
	} catch(error) {
		return next({ status: 500, error: error.message, original: error.original });
	}
	res.json({ room, participants });
});
app.post('/room', authMiddleware, async (req, res, next) => {
	const roomSlug = uuid();
	let room;
	try {
		room = await models.room.create({ ownerId: req.userId, slug: roomSlug });
	} catch(error) {
		return next({ status: 500, error: error.message, original: error.original });
	}
	res.json({ message: 'sucess', room });
});
app.get('/', () => res.json({ message: 'okay' }));
app.use((error, req, res, next) => {
	res.status(error.status || 500).json(error);
});

server.listen(8080, () => {
	console.log('Listening on port 8080');
});