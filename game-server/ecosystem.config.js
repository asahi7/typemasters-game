module.exports = {
  apps: [{
    name: 'game-server',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    env: {
      NODE_ENV: 'dev',
      PORT: '3000'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: '8080'
    }
  }]
}
