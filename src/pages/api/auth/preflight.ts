import { NextApiRequest, NextApiResponse } from "next";
import { AccountAnthenticate } from "@/lib/spotex";
import { AxiosError } from "axios";
import { errorKeys } from "@/pages/auth/signin";
import { getUserByAccount } from "@/services/UserService";
import { LogLogin } from "@/services/LogService";

const spotexCredentials = {
  username: process.env.SPOTEX_USERNAME,
  password: process.env.SPOTEX_PASSWORD,
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const credentials = req.body;

  const authResult = await AccountAnthenticate(credentials);
  if (authResult instanceof AxiosError) {
    console.error(authResult.response.data)
    res.status(400).json({
      redirect: `?error=${errorKeys.serviceDown}`,
    });
    return;
  }

  const success =
    authResult && authResult.data && authResult.data.status === true;
  if (!success) {
    await LogLogin(
      credentials.account || "unknown",
      authResult
        ? JSON.stringify({
            result: authResult.data,
            request: { spotex: spotexCredentials, user: credentials },
          })
        : "no data"
    );
    res.status(400).json({
      redirect: `?error=${errorKeys.invalidCredentials}`,
    });
    return;
  }

  const user = await getUserByAccount(credentials.account, true, false);
  res.status(200).send({
    twoFactorEnabled:
      user && user.settings ? !!user.settings.twoFactorUrl : false,
  });
};