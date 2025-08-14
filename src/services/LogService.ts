import { IUser } from "@/interfaces/account";
import prisma from "@/lib/prisma";
import { getUserByAccount } from "@/services/UserService";

export const LogLogin = async (
  accountNumber: string,
  message: string,
  logType = "debug"
) => {
  if (!accountNumber) {
    return false;
  }

  const existingUser = await getUserByAccount(accountNumber, false, false);

  return await prisma.log.create(
    existingUser
      ? {
          data: {
            account: accountNumber,
            type: logType,
            message,
          },
        }
      : {
          data: {
            type: logType,
            message,
          },
        }
  );
};

export const LogAdminLogin = async (
  user: Partial<IUser>,
  message: string,
  logType = "debug",
  ip: string
) => {
  if (!user || !user.account) {
    return false;
  }

  const existingUser = await getUserByAccount(user.account, false, false);
  if (!existingUser) {
    return;
  }

  return await prisma.log.create({
    data: {
      account: user.account,
      admin: true,
      ip,
      type: logType,
      message,
    },
  });
};
