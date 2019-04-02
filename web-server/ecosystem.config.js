module.exports = {
  apps: [{
    name: 'web-server',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    env: {
      NODE_ENV: 'dev',
      PORT: '3001'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: '8080'
    }
  }]
}