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

- Run `pm2 start`