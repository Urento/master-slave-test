import { Redis } from "ioredis";
import { connectToRedis } from "./db/redis";
import { Heartbeat } from "./heartbeat";
import { v4 as uuidv4 } from "uuid";
import { Channels } from "./channels";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { LoadbalancerReceiver } from "./loadbalancer/loadbalancer";

export let redis: Redis;
export let slaveId: string;
export let ioClient: Socket<DefaultEventsMap, DefaultEventsMap>;
export let masterAddress: string;

require("dotenv").config();

const main = async () => {
  redis = await connectToRedis();
  slaveId = uuidv4();
  masterAddress = process.env.MASTER_ADDRESS!;
  ioClient = io("http://localhost:8080");
  console.log("Waiting for Socket to connect");
  publishNewSlave();
  onExitApplication();

  const heartbeat = new Heartbeat();
  heartbeat.ping();

  const loadbalancerReciever = new LoadbalancerReceiver();
  loadbalancerReciever.listen();
};

const publishNewSlave = () => {
  redis.publish(Channels.NEW_SLAVE, JSON.stringify({ id: slaveId }));
};

const onExitApplication = () => {
  //app is closing
  process.on("exit", (code) => {
    redis.publish(
      Channels.REMOVE_SLAVE,
      JSON.stringify({ id: slaveId, code: code })
    );
    redis.disconnect();
  });

  //ctrl+c
  process.on("SIGINT", (code) => {
    redis.publish(
      Channels.REMOVE_SLAVE,
      JSON.stringify({ id: slaveId, code: code })
    );
    redis.disconnect();
  });

  //kill pid
  process.on("SIGUSR1", (code) => {
    redis.publish(
      Channels.REMOVE_SLAVE,
      JSON.stringify({ id: slaveId, code: code })
    );
    redis.disconnect();
  });
  process.on("SIGUSR2", (code) => {
    redis.publish(
      Channels.REMOVE_SLAVE,
      JSON.stringify({ id: slaveId, code: code })
    );
    redis.disconnect();
  });

  process.on("uncaughtException", (code) => {
    redis.publish(
      Channels.REMOVE_SLAVE,
      JSON.stringify({ id: slaveId, code: code })
    );
    redis.disconnect();
  });
};

main().catch((err) => console.error(err));
