export class Loadbalancer {
  public getBestSlave(): Promise<string> {
    return new Promise((resolve, _reject) => {
      resolve("");
    });
  }
}
