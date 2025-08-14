import { Menu, createStyles, Button, clsx } from "@mantine/core";
import React from "react";
import { setActiveSubAccount } from "@/store/account";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons";
import { useAppDispatch } from "@/pages/_app";
import { IUser } from "@/interfaces/account";
import { signOut } from "next-auth/react";
import LocalStorageService from "@/services/LocalStorageService";

interface AccountSwitchMenuProps {
  subUsers: { [key: string]: Partial<IUser> } | null;
  currentSubAccount: string;
  loginUser: IUser;
  disabled?: boolean;
}

const useStyles = createStyles((theme) => ({
  accountButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedAccount: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.blue[7]
        : theme.colors.blue[7],
  },
  menuItem: {
    minWidth: "130px",
  },
}));

const AccountSwitchMenu = ({
  subUsers,
  currentSubAccount,
  loginUser,
  disabled,
}: AccountSwitchMenuProps) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  return (
    <Menu position="bottom-end" withArrow disabled={disabled}>
      <Menu.Target>
        <Button
          px={"lg"}
          py={0}
          my={"sm"}
          h={"auto"}
          variant={"subtle"}
          disabled={disabled}
          rightIcon={<IconChevronDown />}
        >
          {currentSubAccount}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {loginUser.admin ? (
          <Menu.Item
            className={classes.menuItem}
            icon={<IconUser size={18} />}
            onClick={() => dispatch(setActiveSubAccount(loginUser.account))}
          >
            {loginUser.account}
          </Menu.Item>
        ) : (
          <>
            <Menu.Label>Your accounts</Menu.Label>
            {Object.keys(subUsers).map((subaccount) => (
              <Menu.Item
                key={subaccount}
                icon={<IconUser size={18} />}
                className={clsx(
                  classes.menuItem,
                  subaccount === currentSubAccount
                    ? classes.selectedAccount
                    : null
                )}
                onClick={() => dispatch(setActiveSubAccount(subaccount))}
              >
                {subaccount}
              </Menu.Item>
            ))}
          </>
        )}

        <Menu.Divider />
        <Menu.Item
          icon={<IconLogout size={14} />}
          onClick={() => {
            LocalStorageService.purgeAccountNumber();
            signOut();
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default React.memo(AccountSwitchMenu, (prevProps, nextProps) => {
  if (prevProps.currentSubAccount != nextProps.currentSubAccount) {
    return false;
  }
  if (prevProps.subUsers !== nextProps.subUsers) {
    return false;
  }

  return false;
});
