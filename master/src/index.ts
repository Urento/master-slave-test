import { Redis } from "ioredis";
import express from "express";
import { Channels } from "./channels";
import { connectToRedis } from "./db/redis";
import { SlaveCache } from "./slave/cache/slave.cache";
import { HeartbeatHandler } from "./slave/heartbeat.handler";
import { SlaveHandler } from "./slave/slave.handler";
import http from "http";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Loadbalancer } from "./loadbalancer/balancer.handler";

export let redis: Redis;
export let loadbalancer: Loadbalancer;
export let slaveCache: SlaveCache;
export let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;
export let server: http.Server;
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

  loadbalancer = new Loadbalancer();

  const slaveHandler = new SlaveHandler();
  slaveHandler.listen();

  const heartbeatHandler = new HeartbeatHandler();
  heartbeatHandler.start();

  redis.subscribe(
    Channels.NEW_SLAVE,
    Channels.REMOVE_SLAVE,
    Channels.PING,
    (err, c) => {
      if (err) console.error(err);
      console.log("Subscribed to " + c + " channels");
    }
  );

  io.on("connect", (socket: Socket) => {
    heartbeatHandler.listen(socket);
    loadbalancer.ping(socket);
    loadbalancer.listen(socket);
  });

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

  server.listen(8080);
};

main().catch((err) => console.error(err));
