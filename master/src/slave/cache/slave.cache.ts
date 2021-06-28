import { redisNotSub } from "../../";
import { Slave } from "../slave";

export class SlaveCache {
  public slaves: Map<string, Slave>;

  constructor() {
    this.slaves = new Map<string, Slave>();
  }

  //TODO
  public sync = async () => {
    redisNotSub.keys("slave:*").then((keys) => {
      var pipeline = redisNotSub.pipeline();
      keys.forEach((key) => this.slaves.set(key, new Slave(key)));
      return pipeline.exec();
    });
    console.log(this.slaves.entries());
    console.log(`Synced ${this.slaves.size} to cache`);
  };

  public addSlave = (id: string, slave: Slave) => {
    if (this.isCached(id)) return;
    this.slaves.set(id, slave);
  };

  public removeSlave = (id: string) => {
    if (!this.isCached(id)) return;
    this.slaves.delete(id);
  };

  public isCached = (id: string) => {
    return this.slaves.has(id);
  };
}
