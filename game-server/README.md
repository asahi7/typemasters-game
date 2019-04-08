# Typemasters Game Server

## Overview

This is a game server for Typemasters. The server supports multiple rooms and saves race data into 
a database.

## Installation & Running

To properly run the server you will need to do the following:
In models:

- `npm install`
- `sudo npm install -g sequelize-cli`
- `sudo npm install -g pm2`
- Paste your DB password into models/config/config.json
- `sequelize db:create`
- `sequelize db:migrate`
- Install Redis locally, `brew install redis`
- Run Redis by: `redis-server /usr/local/etc/redis.conf`
- Check Redis by: `redis-cli ping`

- Run `pm2 start`

## Notes

In production, do not forget to include rotation for logs (with pm2), so that if the log files become
too big, it will stick to the limits.

Here is the link: https://github.com/keymetrics/pm2-logrotate