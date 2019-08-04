# Models for Typemasters

## Overview

Database models for Typemasters necessary for both game and web servers.

Do not forget to export the environment, for development the command would be:
`export NODE_ENV=dev`

## Notes

To create a new migration: `sequelize migration:generate --name create-supported-langs`

To execute migrations: `sequelize db:migrate`