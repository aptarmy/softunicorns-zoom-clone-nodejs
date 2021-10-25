const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLOUD_CLIENT_ID);

module.exports = {
	verify: async idToken => {
		return await oauth2Client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLOUD_CLIENT_ID }).then(ticket => ticket.getPayload());
	}
}