module.exports = {
  apps: [{
    name: 'game-server',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'dev',
      PORT: '3000'
    },
    env_production: {
      NODE_ENV: 'prod',
      PORT: '8080'
    }
  }]
}
