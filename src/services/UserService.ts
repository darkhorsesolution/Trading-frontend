import { ISettings, IUser } from "@/interfaces/account";
import prisma from "@/lib/prisma";

const getOrCreateUser = async (
  account: string,
  subaccounts: any[]
): Promise<IUser> => {
  const master = subaccounts.find(
    (subaccount) => subaccount.account === account
  );
  const accounts = subaccounts
    .filter((subaccount) => subaccount.account !== account)
    .map((subaccount) => ({
      ...subaccount,
      masterId: master.account,
    }));

  // if there are some linked subaccounts - then masterId of this parent account equals to account number
  if (accounts.length > 0) {
    master.masterId = account;
  }

  const masterUpdateData = { ...master };
  delete masterUpdateData.institutional;

  /* Upsert master account */
  const freshUser = await prisma.user.upsert({
    where: {
      account,
    },
    update: masterUpdateData,
    create: {
      account,
      status: "",
      accountType: "master",
      ...master,
    },
  });

  // Create settings
  await prisma.settings.upsert({
    where: {
      userId: freshUser.id,
    },
    update: {
      userId: freshUser.id,
    },
    create: {
      userId: freshUser.id,
    },
  });

  /* Insert all subaccounts */
  await prisma.$transaction(
    accounts.map((cur) => {
      const updateData = { ...cur };
      delete updateData.institutional;

      return prisma.user.upsert({
        where: { account: cur.account },
        update: updateData,
        create: { ...cur },
      });
    })
  );

  return await getUserByAccount(account, true, true);
};

const getOrCreateAdminUser = async (
  account: string,
  type: string,
  institutional: boolean
): Promise<IUser> => {
  /* Upsert account */
  const freshUser = await prisma.user.upsert({
    where: {
      account,
    },
    update: {},
    create: {
      account,
      accountType: type,
      admin: true,
      status: "",
      institutional,
      platform: process.env.SPOTEX_USERNAME || "",
    },
  });

  // Create settings
  await prisma.settings.upsert({
    where: {
      userId: freshUser.id,
    },
    update: {
      userId: freshUser.id,
    },
    create: {
      userId: freshUser.id,
    },
  });

  const user = await getUserByAccount(account, true, false);
  user.subUsers = await getPlatformUsers(user.platform);
  return user;
};

const upsertSession = async (session: { userId: string } & any) => {
  return await prisma.session.upsert({
    where: { userId: session.userId },
    update: session,
    create: session,
  });
};

const getPlatformUsers = async (platform: string): Promise<IUser[]> => {
  return await prisma.user.findMany({
    where: { platform },
  });
};

const getUserByAccount = async (
  account: string,
  withSettings: boolean,
  withUsers: boolean
) => {
  const user = await prisma.user.findUnique({
    where: { account },
    include: { settings: withSettings },
  });

  if (!user) {
    return null;
  }

  if (withUsers) {
    if (user.admin) {
      user.subUsers = await getPlatformUsers(user.platform);
    } else if (user.masterId) {
      user.subUsers = await prisma.user.findMany({
        where: {
          masterId: user.masterId,
        },
      });
    }
  }

  return user;
};

const getUserById = async (
  id: string,
  withSettings: boolean,
  withUsers: boolean
) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      settings: withSettings, sessions: {
        orderBy: {
          expires: "desc",
        },
      }
    },
  });

  if (!user) {
    return null;
  }

  if (withUsers) {
    if (user.admin) {
      user.subUsers = await getPlatformUsers(user.platform);
    } else if (user.masterId) {
      user.subUsers = await prisma.user.findMany({
        where: {
          masterId: user.masterId,
        },
      });
    }
  }

  return user;
};

const getSettingsByUserId = async (id: string): Promise<ISettings> => {
  let settings = await prisma.settings.findUnique({
    where: { userId: id },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        userId: id,
      },
    });
  }

  return settings;
};

export {
  getUserByAccount,
  getSettingsByUserId,
  getUserById,
  getPlatformUsers,
  upsertSession as createSession,
  getOrCreateUser,
  getOrCreateAdminUser,
};
