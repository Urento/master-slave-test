export type Job = {
  id: string;
  jobId?: string;
  jobsInQueue?: number;
  jobType: JobType;
};

export enum JobType {
  TEST,
}
