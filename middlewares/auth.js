const { verifyToken } = require('../helpers/jwt');

module.exports = function auth(req, res, next) {
	const authHeader = req.headers.authorization;
	if(!authHeader) { return next({ status: 401, error: 'authorization header is required' }) }
	const extractAuthHeader = /^Bearer\s(.+)$/g.exec(authHeader);
	if(!extractAuthHeader || !extractAuthHeader[1]) { return next({ status: 401, error: 'authorization header is invalid' }) }
	const token = extractAuthHeader[1];
	let payload;
	try {
		payload = verifyToken(token);
	} catch(error) {
		return next({ status: 401, error: error.message });
	}
	req.userId = payload.id;
	req.userEmail = payload.email;
	next();
}