import { Redis } from "ioredis";
import { connectToRedis } from "./db/redis";
import { Heartbeat } from "./heartbeat";
import { v4 as uuidv4 } from "uuid";
import { Channels } from "./channels";
import io from "socket.io-client";

export let redis: Redis;
export let slaveId: string;
export let ioClient: any;
export let masterAddress: string;

require("dotenv").config();

const main = async () => {
  redis = await connectToRedis();
  slaveId = uuidv4();
  masterAddress = process.env.MASTER_ADDRESS!;
  ioClient = io(masterAddress);
  publishNewSlave();
  onExitApplication();

  const heartbeat = new Heartbeat();
  heartbeat.ping();
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
