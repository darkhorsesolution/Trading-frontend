export type Message = {
  type: MessageType;
  data: any;
};

export enum MessageType {
  QuotesUpdate = "quotes-update",
  SubscribeQuotes = "subscribe_quotes",
  UnsubscribeQuotes = "unsubscribe_quotes",
}

export function isMessage(object: any): object is Message {
  return "type" in object && "data" in object;
}
