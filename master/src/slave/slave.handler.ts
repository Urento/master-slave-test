import { redis, slaveCache } from "src";
import { Slave } from "./slave";

export class SlaveHandler {
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
