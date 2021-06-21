import { Slave } from "../slave";

export class SlaveCache {
  public slaves: Map<string, Slave>;

  constructor() {
    this.slaves = new Map<string, Slave>();
  }

  //TODO
  public sync() {
    /**
     * redis.keys('sample_pattern:*').then(function (keys) {
  // Use pipeline instead of sending
  // one command each time to improve the
  // performance.
  var pipeline = redis.pipeline();
  keys.forEach(function (key) {
    pipeline.del(key);
  });
  return pipeline.exec();
});
     */
  }

  public addSlave(id: string, slave: Slave) {
    if (this.isCached(id)) return;
    this.slaves.set(id, slave);
  }

  public removeSlave(id: string) {
    if (!this.isCached(id)) return;
    this.slaves.delete(id);
  }

  public isCached(id: string) {
    return this.slaves.has(id);
  }
}
