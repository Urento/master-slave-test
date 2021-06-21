import { Redis } from "ioredis";
import { connectToRedis } from "./db/redis";

export let redis: Redis;

const main = async () => {
  redis = await connectToRedis();
  setInterval(() => {
    const message = { foo: Math.random() };
    // Publish to my-channel-1 or my-channel-2 randomly.
    const channel = `new_slave`;

    // Message can be either a string or a buffer
    redis.publish(channel, JSON.stringify(message));
    console.log("Published %s to %s", message, channel);
  }, 4000);

  setInterval(() => {
    const message = { foo: Math.random() };
    // Publish to my-channel-1 or my-channel-2 randomly.
    const channel = `remove_slave`;

    // Message can be either a string or a buffer
    redis.publish(channel, JSON.stringify(message));
    console.log("Published %s to %s", message, channel);
  }, 6000);
};

main().catch((err) => console.error(err));
