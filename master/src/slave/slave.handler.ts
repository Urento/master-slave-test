import { redis, slaveCache } from "../";
import { Channels } from "../channels";
import { Slave } from "./slave";

export class SlaveHandler {
  public listen = () => {
    redis.on("message", (channel: Channels, message) => {
      switch (channel) {
        case Channels.NEW_SLAVE:
          console.log("new_slave " + message);
          //const slave = new Slave(uuidv4());
          break;
        case Channels.REMOVE_SLAVE:
          console.log("remove_save " + message);
          break;
        default:
          break;
      }
    });
  };

  public registerNewSlave = async (slave: Slave) => {
    const slaveObj = {
      uuid: slave.id,
    };
    await redis.set(`slave:${slave.id}`, JSON.stringify(slaveObj));
    slaveCache.addSlave(slave.id, slave);
  };

  public removeSlave = async (id: string) => {
    if (!this.exists(id)) return;
    await redis.del(`slave:${id}`);
    slaveCache.removeSlave(id);
  };

  public exists = async (id: string) => {
    return new Promise((resolve, _reject) => {
      redis.exists(`slave:${id}`).then((exists) => {
        resolve(exists === 1 ? true : false);
      });
    });
  };
}
