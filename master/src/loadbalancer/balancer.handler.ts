import moment from "moment";
import { Socket } from "socket.io";

export class Loadbalancer {
  public slaves: Map<string, LoadbalancerType>;
  public lastBestSlave: Map<string, Date>;
  public bestSlave: string;

  constructor() {
    this.slaves = new Map<string, LoadbalancerType>();
    this.lastBestSlave = new Map<string, Date>();
    this.bestSlave = "no best slave found";
  }

  public ping = (socket: Socket) => {
    setInterval(() => {
      socket.emit("get_data_loadbalancer");
      console.log("emit");
    }, 2000);
  };

  public listen = (socket: Socket) => {
    socket.on("data_loadbalancer", async (data: any) => {
      const parsedData = JSON.parse(data);
      const id = parsedData.id;
      this.slaves.set(id, {
        CPU_USE: parsedData.cpu,
        FREE_RAM: parsedData.ram,
        JOBS_IN_QUEUE: 0,
      });
      const bestSlave = await this.getBestSlave();
      console.log("bestSlave:" + bestSlave);
    });
  };

  public getBestSlave = (): Promise<string> => {
    return new Promise((resolve, _reject) => {
      if (this.lastBestSlave.size > 0) {
        const lastBestSlaveDate: Date = this.lastBestSlave.get(this.bestSlave)!;
        const bSlave = this.bestSlave;
        const checkDate = moment().diff(moment(lastBestSlaveDate), "minute");
        if (checkDate >= 1) {
          this.lastBestSlave.clear();
          this.bestSlave = "";
        }
        return resolve(bSlave);
      }
      let lastBestSlave: LoadbalancerType = {
        CPU_USE: 100,
        JOBS_IN_QUEUE: 1000000,
        FREE_RAM: 0,
      };
      this.slaves.forEach(
        async (
          slaveData: LoadbalancerType,
          id: string,
          _map: Map<string, LoadbalancerType>
        ) => {
          if (
            slaveData.CPU_USE < lastBestSlave.CPU_USE &&
            slaveData.JOBS_IN_QUEUE < lastBestSlave.JOBS_IN_QUEUE
          ) {
            lastBestSlave = slaveData;
            this.bestSlave = id;
          }

          if (
            slaveData.CPU_USE < lastBestSlave.CPU_USE &&
            slaveData.FREE_RAM > lastBestSlave.FREE_RAM &&
            slaveData.JOBS_IN_QUEUE < lastBestSlave.JOBS_IN_QUEUE
          ) {
            lastBestSlave = slaveData;
            this.bestSlave = id;
          }

          if (
            slaveData.CPU_USE > lastBestSlave.CPU_USE &&
            slaveData.JOBS_IN_QUEUE < slaveData.JOBS_IN_QUEUE
          ) {
            lastBestSlave = slaveData;
            this.bestSlave = id;
          }

          if (
            slaveData.CPU_USE > lastBestSlave.CPU_USE &&
            slaveData.JOBS_IN_QUEUE < slaveData.JOBS_IN_QUEUE &&
            slaveData.FREE_RAM > lastBestSlave.FREE_RAM
          ) {
            lastBestSlave = slaveData;
            this.bestSlave = id;
          }

          const randomSlave = this.getRandomSlave();
          if (randomSlave === "undefined" || randomSlave === null)
            return resolve(id);
          this.bestSlave = randomSlave!;
        }
      );
      this.lastBestSlave.set(this.bestSlave, new Date());
      return resolve(this.bestSlave);
    });
  };

  //@ts-ignore
  private getRandomSlave = (): string | undefined => {
    let index = Math.floor(Math.random() * this.slaves.size);
    let cntr = 0;
    for (let key of this.slaves.keys()) {
      if (cntr++ === index) {
        return key;
      }
    }
  };
}
