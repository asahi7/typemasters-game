# Typemasters Game Server

## Overview

This is a game server for Typemasters. The server supports multiple rooms and saves race data into 
a database.

## Installation & Running

To properly run the server you will need to do the following:

- `npm install`
- `sudo npm install -g sequelize-cli`
- Paste your DB password into models/config/config.json
- `sequelize db:create`
- Create .env file with your database credentials, like following:

 ```
 DB_HOST=localhost
 DB_USER=root
 DB_PASS=
```

- `sequelize db:migrate`
- Run `node index.js`