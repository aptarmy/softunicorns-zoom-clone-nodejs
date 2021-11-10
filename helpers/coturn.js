var crypto = require('crypto');

module.exports.turnServerCredential = () => {
  const username = (parseInt(Date.now()/1000) + 3*60*60).toString();
  const secret = process.env.COTURN_HMAC_SHA1_SECRET;
  const hmac = crypto.createHmac('sha1', secret);
  hmac.setEncoding('base64');
  hmac.write(username);
  hmac.end();
  const password = hmac.read();
  return { username, password };
}