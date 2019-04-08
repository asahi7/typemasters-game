const redis = require('redis')
const { RateLimiterRedis } = require('rate-limiter-flexible')

// TODO(aibek): separate environments, prod and dev
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  enable_offline_queue: false
})

const rateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'middleware',
  points: 30,
  duration: 1
})

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(429).send({ error: { message: 'Too many requests' } })
    })
}

module.exports = rateLimiterMiddleware
