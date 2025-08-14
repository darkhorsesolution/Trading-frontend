import React from "react";
import { IAsset } from "@/interfaces/IAsset";
import { Session } from "next-auth";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import AccountStats from "@/components/Sidebar/AccountStats";
import { Box, Flex, Select } from "@mantine/core";
import { useAppDispatch } from "../_app";
import { useSelector } from "react-redux";
import { accountSelector, setActiveSubAccount } from "@/store/account";

interface AccountPageProps {
  assets: IAsset[];
  session: Session;
}

const AccountPage = ({ assets, session }: AccountPageProps) => {
  const dispatch = useAppDispatch();
  const { currentSubAccount, subUsers } = useSelector(accountSelector);

  return (
    <Box>
      <Flex>
        <Select
          mr={"auto"}
          ml={"auto"}
          mt={"lg"}
          data={Object.values(subUsers).map((u) => ({
            value: u.account,
            label: u.account,
          }))}
          value={currentSubAccount}
          onChange={(acc) => dispatch(setActiveSubAccount(acc))}
        />
      </Flex>
      <AccountStats />
    </Box>
  );
};

AccountPage.auth = true;

AccountPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <AccountPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default AccountPage;
