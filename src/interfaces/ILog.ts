export interface ILog {
  id: string;
  account: string;
  ip: string;
  type: string;
  event?: LogEvent;
  message?: string;
  group?: string;
  createdAt: string;
}

export interface IConnectionState {
  connected: boolean;
  previous?: boolean;
  time: Date;
}

export enum LogEvent {
  NOTIFICATION = "notification",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  SUBMISSION = "submission",
  MODIFICATION = "modification",
  EXECUTION = "execution",
  REJECTION = "rejection",
}
