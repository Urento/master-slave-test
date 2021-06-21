import { Redis } from "ioredis";
import { Channels } from "./channels";
import { connectToRedis } from "./db/redis";
import { SlaveCache } from "./slave/cache/slave.cache";

export let redis: Redis;
export let slaveCache: SlaveCache;

/**
 * TODO: Loadbalancing
 */

const main = async () => {
  redis = await connectToRedis();

  slaveCache = new SlaveCache();
  slaveCache.sync();

  redis.subscribe(Channels.NEW_SLAVE, Channels.REMOVE_SLAVE, (err, c) => {
    if (err) console.error(err);
    console.log("Subscribed to " + c + " channels");
  });

  redis.on("message", (channel: Channels, message) => {
    switch (channel) {
      case Channels.NEW_SLAVE:
        console.log("new_slave " + message);
        break;
      case Channels.REMOVE_SLAVE:
        console.log("remove_save " + message);
        break;
      default:
        break;
    }
  });
};

main().catch((err) => console.error(err));
