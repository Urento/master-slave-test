import { io } from "../";

export class HeartbeatHandler {
  public heartbeatCache: Map<string, Date>;
  public alreadyPinged: Map<string, Date>;
  //600000
  private TEN_MINUTES: number = 10;

  constructor() {
    this.heartbeatCache = new Map<string, Date>();
    this.alreadyPinged = new Map<string, Date>();
  }

  public listen = () => {
    io.on("pong", (msg) => {
      const id = JSON.parse(msg).id;
      if (id === null) return;
      this.updateLastPing(id);
      console.log("received ping from " + id);
    });
  };

  public start = () => {
    setInterval(() => io.emit("ping"), 9000);
    setInterval(() => this.alreadyPinged.clear(), 12000);
    setInterval(() => this.checkForInactive(), 60000);
  };

  private checkForInactive = () => {
    const map: Map<string, Date> = this.alreadyPinged;
    this.heartbeatCache.forEach((_date: Date, key: string) => {
      if (map.has(key)) return;
      if (this.isInactiveTooLong(key)) {
        this.heartbeatCache.delete(key);
        console.log("Removed Slave " + key + " because of inactivity");
      }
    });
  };

  private getLastPing(id: string): Promise<Date | null> {
    return new Promise(async (resolve, _reject) => {
      if (!this.exists(id)) return resolve(null);
      const lastPing = this.heartbeatCache.get(id);
      return resolve(lastPing!);
    });
  }

  private updateLastPing = async (id: string) => {
    if (this.exists(id)) this.heartbeatCache.delete(id);
    this.heartbeatCache.set(id, new Date());
  };

  public isInactiveTooLong = async (id: string) => {
    return new Promise(async (resolve, _reject) => {
      const lastPing = await this.getLastPing(id);
      console.log(lastPing);
      if (lastPing!.getDate() > Date.now() - this.TEN_MINUTES)
        return resolve(true);
      resolve(false);
    });
  };

  private exists = (id: string) => {
    return this.heartbeatCache.has(id);
  };
}
