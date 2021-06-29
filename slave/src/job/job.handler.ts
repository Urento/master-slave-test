import { ioClient } from "../";
import { Job } from "./job.type";

export class JobHandler {
  public jobQueue: Map<string, Job>;
  public orderToProcess: [{}];
  public currentlyProcessing: number;

  constructor() {
    this.jobQueue = new Map<string, Job>();
    this.currentlyProcessing = 0;
    this.orderToProcess = [{}];
  }

  public listen = () => {
    ioClient.on("new_job", (data: any) => {
      const job = JSON.parse(data) as Job;
      this.process(job);
    });

    ioClient.on("cancel_job", (data: any) => {
      const jobId = JSON.parse(data).jobId;
      if (!this.isInJobQueue(jobId)) return;
      this.jobQueue.delete(jobId);
    });
  };

  public process = (job: Job) => {
    this.currentlyProcessing++;
    if (this.currentlyProcessing > 10) return this.addJobToQueue(job);
  };

  public processQueue = () => {
    setInterval(() => {
      if (this.orderToProcess.length > 0) {
        this.currentlyProcessing--;
        this.process(this.orderToProcess[0] as Job);
        console.log(this.orderToProcess[0] as Job);
        const index = this.orderToProcess.indexOf(this.orderToProcess[0]);
        this.orderToProcess.splice(index, 0);
      }
    }, 1000);
  };

  public addJobToQueue = (job: Job) => {
    this.jobQueue.set(job.jobId!, job);
    this.orderToProcess.push(job);
  };

  private isInJobQueue = (jobId: string) => {
    return this.jobQueue.has(jobId);
  };
}
