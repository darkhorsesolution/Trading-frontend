import axios from "axios";
import {
  SpotexCredentials,
  SpotexDateRange,
  SpotexRequest,
} from "@/lib/spotex/net";
import { IUser } from "@/interfaces/account";

const SERVER = process.env.SPOTEX_URL;

const spotexCredentials = {
  username: process.env.SPOTEX_USERNAME,
  password: process.env.SPOTEX_PASSWORD,
};

export const spotexClient = () =>
  axios.create({
    withCredentials: true,
    baseURL: SERVER,
    auth: spotexCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  });

const paths = {
  AccountSummary: "/accountSummary",
  AccountList: "/acctlistreport",
  AccountAuthenticate: "/authenticate",
};

/**
 * Account summary can be obtained by requesting Account Summary Report for a specific account for a given time period.
 */
type AccountSummaryProps = {
  account: string;
} & SpotexCredentials &
  SpotexDateRange &
  SpotexRequest;

async function AccountSummary({
  account,
  fromDate,
  toDate,
}: {
  account: string;
  fromDate: number;
  toDate?: number;
}): Promise<IUser | null | any> {
  try {
    const resp = await spotexClient().post(
      `${SERVER}${paths.AccountSummary}`,
      JSON.stringify({ account: account, fromDate, toDate }),
      {
        auth: spotexCredentials,
      }
    );
    if (resp && resp.data && resp.data.status === true) {
      return resp.data.primeAccountSummaryRow;
    } else return null;
  } catch (e: any) {
    return e;
  }
}

type AccountListProps = {
  account: string;
};

async function AccountList({
  account,
}: AccountListProps): Promise<IUser | null | any> {
  try {
    const resp = await spotexClient().post(
      `${SERVER}${paths.AccountList}`,
      JSON.stringify({ account: account }),
      {
        auth: spotexCredentials,
      }
    );

    if (resp && resp.data && resp.data.status === true) {
      return resp.data.details;
    } else return null;
  } catch (e: any) {
    return e;
  }
}

async function AccountAnthenticate(credentials: {
  account: string;
  password: string;
}) {
  const { account, password } = credentials;
  try {
    return await spotexClient().post(
      `${SERVER}${paths.AccountAuthenticate}`,
      JSON.stringify({ account, password, request_id: 1 }),
      {
        auth: spotexCredentials,
      }
    );
  } catch (e) {
    return e;
  }
}

class SpotexApi {
  private _username;
  private _password;

  constructor({ username, password }: SpotexCredentials) {
    this._password = password;
    this._username = username;
  }
}

export default SpotexApi;

export { AccountList, AccountSummary, AccountAnthenticate };
