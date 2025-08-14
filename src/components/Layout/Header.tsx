import {
  ActionIcon,
  Button,
  clsx,
  createStyles,
  Divider,
  Group,
  GroupProps,
  Menu,
  Modal,
  ScrollArea,
  Text,
} from "@mantine/core";
import React, { useState } from "react";
import WidgetMenu from "@/components/Layout/WidgetMenu";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";
import AccountStatsPanel from "src/components/Layout/AccountStatsPanel";
import Logo from "../Logo";
import AccountSwitchMenu from "./AccountSwitchMenu";
import { useFullscreen } from "@mantine/hooks";
import {
  IconArrowsDiagonal,
  IconBrandOffice,
  IconCalendar,
  IconDeviceLaptop,
  IconHelp,
  IconMaximize,
  IconMinimize,
  IconMinus,
  IconNews,
  IconSettings,
  IconX,
} from "@tabler/icons";
import { useRouter } from "next/navigation";
import { useRouter as useRouter2 } from "next/router";
import { useDevice, Device } from "@/services/UseDevice";
import Settings from "@/components/Settings/Settings";
import { useSession } from "next-auth/react";
import Workspaces from "@/components/Workspaces/Workspaces";
import { backofficeOpenSelector,workspaceSelector } from "@/store/workspace";
import { ChevronDown } from "lucide-react";
import { modals } from "@mantine/modals";
import About from "@/components/About";
import { useVersion } from "@/lib/version";

const useStyles = createStyles((theme) => ({
  activeIcon: {
    color: theme.colors.blue[8]
  },
  controlIcon: {
    cursor: "pointer",
    "&:hover": {
      opacity: 0.9,
    },
  },
  draggable: {
    flex: "1 !important", // for some reason, it sets flex 0 when switching bright/dark
    position: "relative",
    zIndex: 99999,
    borderRadius: theme.spacing.xs,
    height: "40px",
    opacity: 0.1,
    width: "100%",
  },
  draggableDesktop: {
    "--d": "4px",
    background:
      "radial-gradient(circle at var(--d) var(--d), #000 calc(var(--d) - 1px), #FFFFFF var(--d)) 0 0 / 5px 5px;",
    "&.active": {
      WebkitAppRegion: "drag",
      cursor: "move",
    },
  },
}));

const Dragger = (props) => {
  const { classes } = useStyles();
  const [active, setActive] = useState(false);
  const device = useDevice();

  return (
    <Group
      onMouseMove={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={clsx(
        classes.draggable,
        device === Device.Desktop ? classes.draggableDesktop : ""
      )}
    >
      &nbsp;
    </Group>
  );
};

const Header = React.forwardRef<HTMLDivElement, GroupProps>((props, ref) => {
  const { user, subUsers, loginAccount } = useSelector(accountSelector);
  const backofficeOpen = useSelector(backofficeOpenSelector);
  const { toggle, fullscreen } = useFullscreen();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workspacesOpen, setWorkspacesOpen] = useState(false);
  const loginUser = subUsers[loginAccount];
  const router = useRouter();
  const router2 = useRouter2();
  const device = useDevice();
  const { classes } = useStyles();
  const { data: session } = useSession();
  const { currentWorkspaceId, workspaces, workspacesSyncing } =
    useSelector(workspaceSelector);
  const { version } = useVersion();

  const terminalButtonActive = !backofficeOpen && router2.pathname === "/terminal"
  const newsButtonActive = !backofficeOpen && router2.pathname === "/learn/news"
  const calendarButtonActive = !backofficeOpen && router2.pathname === "/learn/calendar"
  
  return (
    <Group
      ref={ref}
      py={"xs"}
      mx={"xs"}
      my={"xs"}
      px={"sm"}
      noWrap={true}
      sx={(theme) => ({
        borderRadius: theme.spacing.xs,
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 999,
        border: `1px solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[3]
        }`,
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
      })}
      {...props}
    >
      <Modal
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={"Settings"}
        centered={true}
        size={"lg"}
      >
        <Modal.Body style={{position: "relative"}}>
          <Settings
            session={session}
            closeAction={() => setSettingsOpen(false)}
          />
          </Modal.Body>
      </Modal>
      <Modal
        opened={workspacesOpen}
        onClose={() => setWorkspacesOpen(false)}
        title={"Workspaces"}
        centered={true}
        size={"auto"}
      >
        <ScrollArea
          mah={"80vh"}
          style={{ overflow: "auto", position: "relative" }}
        >
          <Workspaces
            workspaces={workspaces}
            workspacesSyncing={workspacesSyncing}
            activeWorkspaceId={currentWorkspaceId}
            style={{ minWidth: "400px" }}
          />
        </ScrollArea>
      </Modal>

      <Logo />

      {router2.pathname === "/terminal" && (
        <Group spacing={0}>
          <Button
            compact={true}
            size={"sm"}
            leftIcon={<IconSettings size={14} />}
            onClick={() => setSettingsOpen(true)}
            variant={"subtle"}
          >
            <Text>Settings</Text>
          </Button>
          <Button
            compact={true}
            size={"sm"}
            variant={"subtle"}
            leftIcon={<IconBrandOffice size={14} />}
            onClick={() => setWorkspacesOpen(true)}
          >
            <Text>Workspaces</Text>
          </Button>
          <Menu shadow="md" width={200} position="bottom-start">
            <Menu.Target>
              <Button
                compact={true}
                title="Widgets"
                variant={"subtle"}
                leftIcon={<IconHelp size={14} />}
                rightIcon={<ChevronDown />}
              >
                Help
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                key={"about"}
                onClick={() =>
                  modals.open({
                    title: "About ATC Trader",
                    children: <About appVersion={version} />,
                  })
                }
              >
                About
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <WidgetMenu admin={loginUser && !!loginUser.admin} />
        </Group>
      )}
      <Dragger />

      <Group spacing={"xs"}>
        <Button
          title={"Terminal"}
          pr={"xs"}
          bg={"transparent"}
          leftIcon={<IconDeviceLaptop className={terminalButtonActive ? classes.activeIcon : undefined}/>}
          onClick={terminalButtonActive ? undefined : (e) => router.push("/terminal")}
          variant={backofficeOpen || router2.pathname !== "/terminal" ? "subtle" : "light"}
        />
        <Button
          bg={"transparent"}
          leftIcon={<IconNews className={newsButtonActive ? classes.activeIcon : undefined}/>}
          title={"News"}
          pr={"xs"}
          onClick={newsButtonActive ? undefined : (e) => router.push("/learn/news")}
          variant={backofficeOpen || router2.pathname !== "/learn/news" ? "subtle" : "light"}
        />
        <Button
          bg={"transparent"}
          title={"Economic Calendar"}
          pr={"xs"}
          leftIcon={<IconCalendar className={calendarButtonActive ? classes.activeIcon : undefined}/>}
          onClick={calendarButtonActive ? undefined : (e) => router.push("/learn/calendar")}
          variant={backofficeOpen || router2.pathname !== "/learn/calendar" ? "subtle" : "light"}
        />
        <ActionIcon
          onClick={toggle}
          title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          variant={"subtle"}
        >
          {fullscreen ? (
            <IconMinimize size={"20px"} />
          ) : (
            <IconMaximize size={"20px"} />
          )}
        </ActionIcon>
      </Group>

      <Group noWrap={true} ml={"auto"}>
        {user && (
          <Group
            ml={"auto"}
            spacing={"sm"}
            my={0}
            px={"sm"}
            noWrap={true}
            py={0}
            align={"center"}
            sx={(theme) => ({
              borderRadius: theme.spacing.xs,
              background:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[9]
                  : theme.colors.gray[0],
            })}
          >
            <AccountStatsPanel user={user} />
            <Divider orientation={"vertical"} />
            <AccountSwitchMenu
              loginUser={subUsers[loginAccount]}
              currentSubAccount={user.account}
              subUsers={subUsers}
            />
          </Group>
        )}
        {device === Device.Desktop && (
          <Group spacing={"xs"} noWrap={true}>
            <ActionIcon
              bg={"red.6"}
              size={"xs"}
              c={"red.9"}
              radius={"xl"}
              onClick={(e) => window.ipc.send("close", null)}
              title="Close"
              className={classes.controlIcon}
            >
              <IconX />
            </ActionIcon>
            <ActionIcon
              size={"xs"}
              bg={"yellow.4"}
              radius={"xl"}
              c={"yellow.9"}
              onClick={(e) => window.ipc.send("minimize", null)}
              title="Minimize"
              className={classes.controlIcon}
            >
              <IconMinus />
            </ActionIcon>
            <ActionIcon
              size={"xs"}
              bg={"green.4"}
              c={"green.9"}
              radius={"xl"}
              onClick={(e) => window.ipc.send("maximize", null)}
              title="Maximize"
              className={classes.controlIcon}
            >
              <IconArrowsDiagonal />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Group>
  );
});

export default Header;
