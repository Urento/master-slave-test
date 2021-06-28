import { ioClient, slaveId } from "../";
import os from "os";
import { __prod__ } from "../constants";

export class LoadbalancerReceiver {
  public listen = () => {
    ioClient.on("get_data_loadbalancer", () => {
      const cpuUsage = __prod__ ? os.loadavg().toString().split(",")[0] : 10;
      const usedmem = os.totalmem() - os.freemem();
      const freeRam = (usedmem / os.totalmem()) * 100;
      console.log(cpuUsage + "% - " + freeRam + "%");

      ioClient.emit(
        "data_loadbalancer",
        JSON.stringify({ id: slaveId, cpu: cpuUsage, ram: freeRam })
      );
    });
  };
}
