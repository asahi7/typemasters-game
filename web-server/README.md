# Typemasters Web Server

## Overview

This is a web server for Typemasters. The server is an API bridge between clients and static data.  

## Installation & Running

To properly run the server you will need to do the following:

- Firstly you must have your game server installed.
- Run `pm2 start`

## Notes

In production, do not forget to include rotation for logs (with pm2), so that if the log files become
too big, it will stick to the limits.

Here is the link: https://github.com/keymetrics/pm2-logrotate

`sudo npm install -g snyk` for finding vulnerabilities in dependencies.
`snyk test`