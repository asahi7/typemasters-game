#Typemasters Game Server

## Set up

To properly run the server you will need to do the following:

- `npm install`
- `sudo npm install -g sequelize-cli`
- Paste your DB password into config/config.json
- `sequelize db:create`
- Create .env file with your database credentials
- `sequelize db:migrate`
