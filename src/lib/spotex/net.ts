export type SpotexRequest = {
  request_id: string;
};
export type SpotexResponse = {
  request_id: number | string;
  status: boolean;
  text: string;
};

export type SpotexCredentials = {
  username: string;
  password: string;
};
export type SpotexDateRange = {
  fromDate: number;
  toDate?: number;
};
