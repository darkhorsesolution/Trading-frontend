import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AccountAnthenticate, AccountList } from "@/lib/spotex";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextApiHandler } from "next";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

import {
  createSession,
  getOrCreateAdminUser,
  getOrCreateUser,
  getUserById,
} from "@/services/UserService";
import { LogAdminLogin, LogLogin } from "@/services/LogService";
import { AxiosError } from "axios";
import { errorKeys } from "@/pages/auth/signin";
import { IUser } from "@/interfaces/account";
import { makeOTP } from "@/lib/2fa";
import { setCookie } from "nookies";

const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",    // Seconds - How long until an idle session expires and is no longer valid.
  },
  callbacks: {
    async signIn({ user, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = JSON.parse(
        JSON.stringify(await getUserById(token.uid as string, true, true))
      );

      const now = new Date().getTime();
      let validSession = session.user.sessions.find((s) => new Date(s.expires).getTime() > now);
      if (!validSession) {
        validSession = await createSession({
          sessionToken: token.jti,
          userId: session.user.id,
          expires: session.expires,
        });
      }

      session.wsToken = validSession.sessionToken;
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/signin", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
  },
  logger: {
    error: (code, metadata) => {
      logger.error(code, metadata);
    },
    warn: (code) => {
      logger.warn(code);
    },
    debug: (code, metadata) => {
      logger.debug(code, metadata);
    },
  },
  events: {},
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        account: { label: "Account", type: "text", placeholder: "13502154" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (
        credentials: {
          account: string;
          password: string;
          twoFactorCode?: string;
        },
        req
      ) => {
        const res = await AccountAnthenticate(credentials);
        if (res instanceof AxiosError) {
          console.error(res.response.data);
          throw new Error(errorKeys.serviceDown);
        }

        const success = res && res.data && res.data.status === true;
        const { account } = credentials;
        if (!success) {
          await LogLogin(account, "Client login unsuccessful", "info");
          throw new Error(errorKeys.invalidCredentials);
        }

        const isAdmin = res.data.account_type === "BR";
        const institutional = process.env.INSTITUTIONAL === "1";

        let user: IUser;
        if (isAdmin) {
          const { account_type } = res.data;
          try {
            user = await getOrCreateAdminUser(
              account,
              account_type,
              institutional
            );
          } catch (e) {
            throw new Error(errorKeys.internalServerError);
          }
        } else {
          let linkedAccounts = (await AccountList({ account })) || [];
          // institutional version - disable switching for accounts
          if (institutional) {
            linkedAccounts = linkedAccounts.filter(
              (a) => a.account === account
            );
          }

          try {
            user = await getOrCreateUser(
              account,
              linkedAccounts.map((acc) => ({
                account: acc.account,
                email: acc.email,
                dob: acc.dob,
                phone: acc.phone,
                status: acc.status,
                firstName: acc.first_name,
                lastName: acc.last_name,
                accountType: acc.account_type,
                currency: acc.currency,
                platform: acc.platform,
                hedged: acc.hedge === "YES",
                institutional,
              }))
            );
          } catch (e) {
            console.error(e);
            throw new Error(errorKeys.internalServerError);
          }
        }

        if (user.settings.twoFactorUrl) {
          if (!credentials.twoFactorCode) {
            throw new Error(errorKeys.twoFactorFailed);
          }

          const totp = makeOTP(user.account, user.settings.twoFactorBase32);
          if (totp.validate({ token: credentials.twoFactorCode }) !== 0) {
            throw new Error(errorKeys.twoFactorFailed);
          }
        }

        await LogLogin(account, "Client logged in", "info");
        await LogAdminLogin(
          user,
          "Client logged in",
          "info",
          (req.headers["x-real-ip"] as string) || "-"
        );

        return user;
      },
    }),
  ],
};

export const buildAuthOptions = (req, res): NextAuthOptions => {
  const secure = process.env.NODE_ENV === "production";
  const rememberMeRequest = req.body?.rememberMe === "true";
  let rememberMe = req.cookies["remember"] && req.cookies["remember"] === "1";

  if (req.body?.rememberMe !== undefined) {
    rememberMe = rememberMeRequest;
    setCookie({ res }, "remember", rememberMeRequest ? "1" : "0", {
      maxAge: 86400 * 30,
      httpOnly: false, // !secure,
      path: "/",
      secure: secure,
      sameSite: "lax",
    });
  }

  return {
    ...authOptions,
    ...{
      session: {
        strategy: "jwt",

        // Seconds - How long until an idle session expires and is no longer valid.
        maxAge: rememberMe ? 24 * 60 * 60 * 30 : 24 * 60 * 60 * 3,  // 30 days vs 3 days

        // Seconds - Throttle how frequently to write to database to extend a session.
        updateAge: 86400, // unused in jwt
      },
    },
    events: {
      signOut: async (message: { session: Session; token: JWT }) => {
        const user = await getUserById(
          (message.token as any).uid,
          false,
          false
        );
        if (!user) {
          return;
        }

        await LogLogin(user.account, "Client signed out", "info");
        await LogAdminLogin(
          { account: user.account },
          "Client signed out",
          "info",
          (req.headers["x-real-ip"] as string) || "-"
        );
      },
    },
  } as NextAuthOptions;
};

const authHandler: NextApiHandler = (req, res) => {
  return NextAuth(req, res, buildAuthOptions(req, res));
};

export default authHandler;