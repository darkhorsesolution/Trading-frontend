import { IAsset } from "@/interfaces/IAsset";
import { Device, useDevice } from "@/services/UseDevice";
import { settingsSelector } from "@/store/account";
import {
  AppShell,
  Burger,
  createStyles,
  Footer,
  Group,
  Header,
  MediaQuery,
  Navbar,
  UnstyledButton,
  useMantineTheme,
  Text,
  clsx,
} from "@mantine/core";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  IconArrowsDoubleNeSw,
  IconChartBar,
  IconGraph,
  IconTrendingUp,
  IconWallet,
  TablerIcon,
} from "@tabler/icons";
import DataServiceAgent from "src/components/DataService/DataServiceAgent";
import { setAssets } from "@/store/assets";
import { useAppDispatch } from "@/pages/_app";
import Logo from "@/components/Logo";
import { MobileMenu } from "@/components/mobile/MobileLayout/Menu";

const useStyles = createStyles((theme) => ({
  footer: {
    background:
      theme.colorScheme === "dark"
        ? theme.colors.gray[9]
        : theme.colors.gray[9],
  },
  footerItems: {
    justifyContent: "center",
  },
  highlightButton: {
    background: theme.colors.blue[6],
    width: 64,
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-20px",
    marginBottom: "-20px",
    borderRadius: "100%",
    color: theme.white,
    border: `3px solid ${theme.colors.blue[5]}`,
    boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.33);",
  },
  menuButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px 10px",
    width: "60px",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[5]
        : theme.colors.gray[5],
    "&.active": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.blue[5]
          : theme.colors.blue[5],
    },
  },
}));

interface MenuButtonProps {
  path: string;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  icon: TablerIcon;
  highlight?: boolean;
}

interface MobileLayoutProps {
  assets: IAsset[];
  session: Session;
  children?: ReactNode;
}

const MenuBtn = ({
  icon: Icon,
  onClick,
  label,
  active,
  highlight,
}: MenuButtonProps) => {
  const { classes } = useStyles();

  return highlight ? (
    <UnstyledButton className={classes.highlightButton} onClick={onClick}>
      <Icon />
    </UnstyledButton>
  ) : (
    <UnstyledButton
      variant={active ? "light" : "subtle"}
      onClick={onClick}
      className={clsx(classes.menuButton, active ? "active" : "")}
    >
      <Icon />
      <Text size={9}>{label}</Text>
    </UnstyledButton>
  );
};

const menuItems: MenuButtonProps[] = [
  {
    path: "/app/market",
    label: "Market",
    icon: IconChartBar,
  },
  {
    path: "/app/chart",
    label: "Chart",
    icon: IconGraph,
  },
  {
    path: "/app/order",
    label: "Trade",
    icon: IconArrowsDoubleNeSw,
  },
  {
    path: "/app/positions",
    label: "Positions",
    icon: IconTrendingUp,
  },
  {
    path: "/app/account",
    label: "Account",
    icon: IconWallet,
  },
];

const MobileLayout = ({ assets, session, children }: MobileLayoutProps) => {
  const { classes } = useStyles();
  const device = useDevice();
  const router = useRouter();
  const settings = useSelector(settingsSelector);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!assets) {
      return;
    }
    setAssets(assets);
  }, [assets]);

  useEffect(() => {
    if (device === Device.NotSet) {
      return;
    }
    if (device !== Device.Mobile) {
      router.push("/terminal");
    }
  }, [device]);

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const handler = (url, { shallow }) => {
      setOpened(false);
    };
    router.events.on("routeChangeStart", handler);

    return () => router.events.off("routeChangeStart", handler);
  }, []);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      padding={0}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <MobileMenu />
        </Navbar>
      }
      footer={
        <Footer height={70} p="md">
          <Group className={classes.footerItems}>
            {menuItems.map((item) => (
              <MenuBtn
                key={item.path}
                path={item.path}
                onClick={() => router.push(item.path)}
                active={router.asPath.indexOf(item.path) !== -1}
                highlight={item.highlight}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </Group>
        </Footer>
      }
      header={
        <Header height={{ base: 50, md: 70 }} p="md" bg={theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white}>
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Logo ml={0} />

            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                ml="auto"
              />
            </MediaQuery>
          </div>
        </Header>
      }
    >
      {settings ? children : ""}
      <DataServiceAgent session={session} render={false} />
    </AppShell>
  );
};

export default MobileLayout;
