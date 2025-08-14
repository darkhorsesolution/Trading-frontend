export interface IMessage {
  id: string;
  subject: string;
  text: string;
  userId?: string;
  unseen?: boolean;
  createdAt: string;
}
