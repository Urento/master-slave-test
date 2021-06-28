import { Job } from "./job.type";
import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";

export class JobHandler {
  public activeJobs: Map<string, Job>;

  constructor() {
    // string is the id from the slave
    this.activeJobs = new Map<string, Job>();
  }

  public queueJob = (job: Job, socket: Socket) => {
    return new Promise((resolve, _reject) => {
      if (job.id === "" || job.jobType === null)
        return resolve(new Error("Job Id or Type null"));
      const jobId = uuidv4();
      job.jobId = jobId;
      this.activeJobs.set(job.id, job);
      console.log(
        "queued job " +
          job.id +
          " - " +
          job.jobId +
          " - " +
          job.jobType +
          " - " +
          job.jobsInQueue
      );
      socket.emit("new_job", JSON.stringify(job));
      return resolve(job.jobId);
    });
  };

  public cancelJob = (jobId: string) => {};

  public getJobQueue = (id: string) => {};

  public getJobsInQueue = (id: string): Promise<number> => {
    return new Promise((resolve, _reject) => {
      if (!this.exists(id)) return resolve(0);
      let i: number = 0;
      this.activeJobs.forEach((_value: Job, key: string) => {
        if (key === id) i++;
      });
      return resolve(i);
    });
  };

  private exists = (id: string): boolean => {
    return this.activeJobs.has(id);
  };

  public getSlaveWithLeastJobsInQueue = () => {};
}
