import { Job } from "./job.type";
import { v4 as uuidv4 } from "uuid";
import { Socket } from "socket.io";
import { loadbalancer } from "../";

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

  /**
   * @param jobId
   * @returns true: successfully canceled; false: failed to cancel the job
   */
  public cancelJob = (jobId: string, socket: Socket) => {
    return new Promise((resolve, _reject) => {
      if (!this.existsByJobId(jobId)) resolve(false);
      socket.emit("cancel_job", JSON.stringify({ jobId: jobId }));
    });
  };

  public getJobQueue = (id: string) => {
    return new Promise((resolve, _reject) => {
      let jobs: [{}] = [{}];
      this.activeJobs.forEach((job: Job, key: string) => {
        if (key === id) jobs.push(job);
      });
      console.log(jobs);
      resolve(jobs);
    });
  };

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

  private existsByJobId = (jobId: string) => {
    return new Promise((resolve, _reject) => {
      let exists: boolean = false;
      this.activeJobs.forEach((job: Job, key: string) => {
        if (job.jobId === jobId) exists = true;
      });
      resolve(exists);
    });
  };

  private getJobByJobId = (jobId: string): Promise<Job | null> => {
    return new Promise((resolve, _reject) => {
      if (!this.existsByJobId(jobId)) resolve(null);
      this.activeJobs.forEach((job: Job, key: string) => {
        if (job.jobId === jobId) resolve(job);
      });
    });
  };

  public getSlaveWithLeastJobsInQueue = () => {
    return new Promise((resolve, _reject) => {
      let lastLeastJobsInQueue: number = 100000000000;
      let slaveId: string = "no slave found";
      this.activeJobs.forEach(async (_job: Job, key: string) => {
        const jobsInQueue = await this.getJobsInQueue(key);
        if (jobsInQueue < lastLeastJobsInQueue) slaveId = key;
      });
      //pick a random slave
      if (slaveId === "no slave found") {
        const randomSlave = loadbalancer.getRandomSlave();
        resolve(randomSlave);
      }
      resolve(slaveId);
    });
  };
}
