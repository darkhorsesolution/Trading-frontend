import "next-auth";
import { IUser } from "@/interfaces/account";
import { ISODateString } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: IUser;
    expires: ISODateString;
    wsToken?: string;
  }
}
