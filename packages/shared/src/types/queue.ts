export type JobType = "processBatch";
export type QueueNameType = "withdrawal-aggregator";

export interface JobPayload {
  groupId: string;
}

export interface QueueJobData {
  type: JobType;
  payload: JobPayload;
}
