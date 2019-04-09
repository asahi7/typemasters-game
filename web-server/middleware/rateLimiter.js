const redis = require('redis')
const { RateLimiterRedis } = require('rate-limiter-flexible')

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
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
