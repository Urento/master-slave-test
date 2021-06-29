export type Job = {
  id: string;
  jobId?: string;
  jobsInQueue?: number;
  jobType: JobType;
  createdOn: Date;
};

export enum JobType {
  TEST,
}
