import {
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useEffect, useState } from "react";
import AccountStats from "./AccountStats";
import OrderPanel from "../Order/Order";
import { useSelector } from "react-redux";
import {
  createOrderSelector,
  editedOrderSelector,
  setCreateOrder,
} from "@/store/orders";
import NewsFeed from "./NewsFeed";
import Calendar from "./Calendar";
import Messages from "./Messages";
import {
  CalendarIcon,
  EyeIcon,
  GraduationCapIcon,
  MegaphoneIcon,
  NewspaperIcon,
  PieChartIcon,
  YoutubeIcon,
} from "lucide-react";
import { IconArrowsDoubleNeSw } from "@tabler/icons";
import { MantineStyleSystemProps } from "@mantine/styles/lib/theme/types/MantineStyleSystem";
import Videos from "@/components/Sidebar/Videos";
import Learn from "@/components/Sidebar/Learn";
import * as React from "react";
import { useAppDispatch } from "@/pages/_app";

enum DrawerComponents {
  STATS = "s",
  MESSAGES = "m",
  ORDER = "o",
  NEWS = "n",
  CALENDAR = "c",
  INSIGHT = "i",
  VIDEOS = "v",
  LEARN = "l",
}
const useStyles = createStyles((theme) => ({
  drawer: {
    gap: 0,
    alignItems: "start",
    overflow: "hidden",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
  },
  orderPanel: {
    margin: theme.spacing.sm,
  },
  button: {
    ".mantine-Button-icon": {
      margin: 0
    }
  }
}));

interface DrawerProps extends MantineStyleSystemProps {
  className?: string;
  style?: any;
}

const BoxSize = "25vw";
const Scrollable = ({ children }) => (
  <ScrollArea
    style={{ height: "100%", overflow: "hidden", width: BoxSize }}
    h={"100%"}
  >
    {children}
  </ScrollArea>
);

const Sidebar = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, ...props }, ref) => {
    const { classes, cx } = useStyles();
    const [control, setControl] = useState("");
    const [loadingActive] = useState(false);
    const editedOrder = useSelector(editedOrderSelector);
    const createOrder = useSelector(createOrderSelector);
    const dispatch = useAppDispatch();

    useEffect(() => {
      if (editedOrder) {
        setControl(DrawerComponents.ORDER);
      } else if (createOrder) {
        setControl(DrawerComponents.ORDER);
      }
    }, [editedOrder, createOrder]);

    return (
      <Group
        className={cx(classes.drawer, className)}
        ml={0}
        pl={0}
        {...props}
        ref={ref}
      >
        <Stack spacing={0} h={"auto"}>
          {[
            {
              title: "Stats",
              value: DrawerComponents.STATS,
              leftIcon: <PieChartIcon />,
            },
            {
              title: "Messages",
              value: DrawerComponents.MESSAGES,
              leftIcon: <MegaphoneIcon />,
            },
            {
              title: "Order",
              value: DrawerComponents.ORDER,
              leftIcon: <IconArrowsDoubleNeSw />,
              onClick: () => {
                dispatch(setCreateOrder(null));
              }
            },
            {
              title: "News Feed",
              value: DrawerComponents.NEWS,
              leftIcon: <NewspaperIcon />,
            },
            {
              title: "Calendar",
              value: DrawerComponents.CALENDAR,
              leftIcon: <CalendarIcon />,
            },
            /*{
              title: "Market Insight",
              value: DrawerComponents.INSIGHT,
              leftIcon: <EyeIcon />,
            },
            {
              title: "Videos",
              value: DrawerComponents.VIDEOS,
              leftIcon: <YoutubeIcon />,
            },
            {
              title: "Education",
              value: DrawerComponents.LEARN,
              leftIcon: <GraduationCapIcon />,
            },
          */
          ].map((button) => (
            <Button
              key={button.title}
              {...button}
              variant={control === button.value ? "filled" : "subtle"}
              size={"lg"}
              px={12}
              className={classes.button}
              onClick={(val) => {
                if(button.onClick) {
                  button.onClick();
                }
                setControl(
                  button.value !== control
                    ? (button.value as DrawerComponents)
                    : null
                )
              }}
              py={"sm"}
              radius={0}
            ></Button>
          ))}
        </Stack>

        {control && (
          <>
            <Divider orientation={"vertical"} size={"sm"} h={"100%"} />

            {control === DrawerComponents.STATS && (
              <Scrollable>
                <AccountStats />
              </Scrollable>
            )}
            {control === DrawerComponents.MESSAGES && (
              <Scrollable>
                <Messages />
              </Scrollable>
            )}
            {control === DrawerComponents.NEWS && (
              <Scrollable>
                <NewsFeed />
              </Scrollable>
            )}
            {control === DrawerComponents.CALENDAR && (
              <Scrollable>
                <Calendar />
              </Scrollable>
            )}
            {control === DrawerComponents.ORDER && (
              <Box
                p={"md"}
                style={{
                  flex: 1,
                  minWidth: BoxSize,
                  display: "flex",
                  height: "100%",
                  flexDirection: "column",
                  overflow: "auto",
                }}
              >
                <OrderPanel
                  defaultSymbol={createOrder}
                  order={editedOrder}
                  key={editedOrder ? editedOrder.id : "0"}
                  className={classes.orderPanel}
                  closeAction={() => {
                    dispatch(setCreateOrder(null));
                  }}
                  symbolChangeAction={() => {
                    if (!editedOrder) {
                      dispatch(setCreateOrder(null));
                    }
                  }}
                />
              </Box>
            )}
            {control === DrawerComponents.VIDEOS && (
              <Scrollable>
                <Videos />
              </Scrollable>
            )}
            {control === DrawerComponents.LEARN && (
              <Scrollable>
                <Learn />
              </Scrollable>
            )}
            <LoadingOverlay visible={loadingActive} />
          </>
        )}
      </Group>
    );
  }
);

export default Sidebar;
