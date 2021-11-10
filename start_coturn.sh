#!/bin/bash
# username = UNIX timestamp
# password = HMAC(secret, username)
docker run -d --network=host --rm --name coturn \
instrumentisto/coturn \
-n \
--realm=softunicorns.com \
--fingerprint \
--lt-cred-mech \
--static-auth-secret=my_keyboard_cat \
--listening-ip=0.0.0.0 \
--log-file=stdout \
--simple-log