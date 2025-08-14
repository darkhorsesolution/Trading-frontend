import {
  connect,
  disconnect,
  notification,
  orderExecution,
  orderRejection,
  orderSubmissionModification,
} from "public/static/sounds/index";

export enum EventType {
  Connect = "connect",
  Disconnect = "disconnect",
  Notification = "notification",
  Execution = "execution",
  Rejection = "rejection",
  Submission = "submission",
}

export interface IEvent {
  type: EventType;
  id: string;
}

export const newEvent = (eType: EventType, id: string): IEvent => ({
  type: eType,
  id,
});

export const sounds = {
  connect,
  disconnect,
  notification,
  orderExecution,
  orderRejection,
  orderSubmissionModification,
};
