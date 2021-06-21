import Redis from "ioredis";
require("dotenv").config();

let cachedRedis: Redis.Redis;

export const connectToRedis = async (
  host = process.env.REDIS_HOST,
  password = process.env.REDIS_PASSWORD,
  port = process.env.REDIS_PORT
) => {
  let redis: Redis.Redis;
  if (cachedRedis) return cachedRedis;
  if (password != "") {
    redis = new Redis({
      port: Number(port),
      host: host,
      password: password,
    });
  } else {
    redis = new Redis({
      port: Number(port),
      host: host,
    });
  }
  cachedRedis = redis;
  return redis;
};
