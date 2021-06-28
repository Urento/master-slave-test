import { redis, redisNotSub, slaveCache } from "../";
import { Channels } from "../channels";
import { Slave } from "./slave";
import { v4 as uuidv4 } from "uuid";

export class SlaveHandler {
  public slaveToSocket: Map<string, string>;

  constructor() {
    this.slaveToSocket = new Map<string, string>();
  }

  public listen = () => {
    redis.on("message", (channel: Channels, message: string) => {
      switch (channel) {
        case Channels.NEW_SLAVE:
          console.log("new_slave " + message);
          const slave = new Slave(uuidv4());
          this.registerNewSlave(slave);
          this.registerSocket(slave.id, JSON.parse(message).socketId);
          break;
        case Channels.REMOVE_SLAVE:
          console.log("remove_save " + message);
          this.removeSlave(JSON.parse(message).id);
          break;
        default:
          break;
      }
    });
  };

  public registerNewSlave = async (slave: Slave) => {
    const slaveObj = {
      id: slave.id,
    };
    await redisNotSub.set(`slave:${slave.id}`, JSON.stringify(slaveObj));
    slaveCache.addSlave(slave.id, slave);
  };

  public removeSlave = async (id: string) => {
    if (!this.exists(id)) return;
    await redisNotSub.del(`slave:${id}`);
    slaveCache.removeSlave(id);
  };

  public registerSocket = (id: string, socketId: string) => {
    this.slaveToSocket.set(id, socketId);
  };

  public exists = async (id: string) => {
    return new Promise((resolve, _reject) => {
      redisNotSub.exists(`slave:${id}`).then((exists) => {
        resolve(exists === 1 ? true : false);
      });
    });
  };
}
