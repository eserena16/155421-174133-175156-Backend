const Redis = require("ioredis");
const config = require("../config/redis.config.js");
var { logger } = require("../utils/logger");

function createRedisInstance() {
  try {
    const options = {
      host: config.REDIS_DOCKER_HOST,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error({
            action: "createRedisInstance",
            message: `[Redis] Could not connect after ${times} attempts.`,
          });
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    };

    if (config.REDIS_DOCKER_PORT) {
      options.port = config.REDIS_DOCKER_PORT;
    }
    if (config.REDIS_DOCKER_PASSWORD) {
      options.password = config.REDIS_DOCKER_PASSWORD;
    }
    const redis = new Redis(options);

    redis.on("error", (error) => {
      logger.warn({
        action: "createRedisInstance",
        message: `[Redis] Error connecting.`,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.name,
      });
    });

    return redis;
  } catch (e) {
    logger.error({
      action: "createRedisInstance",
      message: `[Redis] Could not create a Redis instance.`,
      errorMessage: e.message,
      errorStack: e.stack,
      errorType: e.name,
    });
    return null;
  }
}

module.exports = {
  createRedisInstance,
};
