import { ioClient, slaveId } from "./";

export class Heartbeat {
  public idObj = { id: slaveId };

  public ping = () => {
    ioClient.on("ping", () => {
      console.log("Ping from master (" + new Date() + ")");
      ioClient.emit("pong", JSON.stringify(this.idObj));
    });
  };
}
