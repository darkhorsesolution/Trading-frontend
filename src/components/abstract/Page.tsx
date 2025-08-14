import {NextPage} from "next";

export type Page<P = any, IP = P> = NextPage<P, IP> & {
    requireAuth?: boolean
};