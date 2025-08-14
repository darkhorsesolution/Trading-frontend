import { Box, NavLink } from "@mantine/core";
import {
  IconMessages,
  IconDoorExit,
  TablerIcon,
  IconHomeCog,
  IconUser,
  IconNews,
  IconCalendar,
} from "@tabler/icons";
import LocalStorageService from "@/services/LocalStorageService";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

interface MenuItem {
  onClick?: () => void;
  link: string;
  label: string;
  icon: TablerIcon;
}

const tabs: Record<"top" | "bottom", MenuItem[]> = {
  top: [
    {
      link: "/app/messages",
      label: "Messages",
      icon: IconMessages,
    },
    {
      link: "/app/news",
      label: "News",
      icon: IconNews,
    },
    {
      link: "/app/calendar",
      label: "Calendar",
      icon: IconCalendar,
    },
    {
      link: "/app/settings",
      label: "Settings",
      icon: IconHomeCog,
    },
    {
      link: "/app/account",
      label: "Account",
      icon: IconUser,
    },
  ],
  bottom: [
    {
      link: "logout",
      label: "Logout",
      onClick: () => {
        LocalStorageService.purgeAccountNumber();
        signOut();
      },
      icon: IconDoorExit,
    },
  ],
};

export function MobileMenu(props) {
  const router = useRouter();

  return (
    <>
      {tabs.top.map((item) => (
        <NavLink
          key={item.link}
          label={item.label}
          icon={<item.icon size={24} stroke={1.5} />}
          variant="filled"
          active={router.pathname === item.link}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              router.push(item.link);
            }
          }}
        />
      ))}

      <Box mt={"auto"} mb={"sm"} />

      {tabs.bottom.map((item) => (
        <NavLink
          key={item.link}
          label={item.label}
          icon={<item.icon size={24} stroke={1.5} />}
          variant="filled"
          active={router.pathname === item.link}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              router.push(item.link);
            }
          }}
        />
      ))}
    </>
  );
}
