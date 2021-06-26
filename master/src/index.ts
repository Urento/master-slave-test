import { Redis } from "ioredis";
import express from "express";
import { Channels } from "./channels";
import { connectToRedis } from "./db/redis";
import { SlaveCache } from "./slave/cache/slave.cache";
import { HeartbeatHandler } from "./slave/heartbeat.handler";
import { SlaveHandler } from "./slave/slave.handler";
import http from "http";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export let redis: Redis;
export let slaveCache: SlaveCache;
export let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;
export let server: any;
export let app: any;

/**
 * TODO: Loadbalancing
 */

const main = async () => {
  redis = await connectToRedis();
  app = express();
  server = http.createServer(app);
  io = new Server(server);

  slaveCache = new SlaveCache();
  slaveCache.sync();

  const slaveHandler = new SlaveHandler();
  slaveHandler.listen();

  const heartbeatHandler = new HeartbeatHandler();
  heartbeatHandler.listen();

  redis.subscribe(
    Channels.NEW_SLAVE,
    Channels.REMOVE_SLAVE,
    Channels.PING,
    (err, c) => {
      if (err) console.error(err);
      console.log("Subscribed to " + c + " channels");
    }
  );

  /*redis.on("message", (channel: Channels, message) => {
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
  });*/
};

main().catch((err) => console.error(err));
