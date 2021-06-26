import { redis } from "./";
import { Channels } from "./channels";

export class Heartbeat {
  public ping = () => {
    setInterval(() => {
      redis.publish(Channels.PING, JSON.stringify({ id: "123" }));
      console.log("ping");
    }, 2000);
  };
}
