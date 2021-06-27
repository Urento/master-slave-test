import { Socket } from "socket.io";

type LoadbalancerType = {
  CPU_USE: number;
  FREE_RAM: number;
  JOBS_IN_QUEUE: number;
};

export class Loadbalancer {
  public loadBalanceData: Map<string, LoadbalancerType>;

  constructor() {
    this.loadBalanceData = new Map();
  }

  /**
   * get the data
   */
  public ping = (socket: Socket) => {
    setInterval(() => {
      socket.emit("get_data_loadbalancer");
      console.log("emit");
    }, 20000);
  };

  public listen = (socket: Socket) => {
    socket.on("data_loadbalancer", (data: any) => {
      const parsedData = JSON.parse(data);
      const id = parsedData.id;
      console.log(parsedData);
      this.loadBalanceData.set(id, {
        CPU_USE: parsedData.cpu,
        FREE_RAM: parsedData.ram,
        JOBS_IN_QUEUE: 0,
      });
      console.log(this.loadBalanceData.get(id));
    });
  };

  public getBestSlave = (): Promise<string> => {
    return new Promise((resolve, _reject) => {
      resolve("");
    });
  };

  public getLeastJobsInQueue = () => {};
}
