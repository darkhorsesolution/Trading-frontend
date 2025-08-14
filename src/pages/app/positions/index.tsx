import React, { useEffect, useState } from "react";
import { IAsset } from "@/interfaces/IAsset";
import MobileLayout from "@/components/mobile/MobileLayout/Layout";
import { defaultGetServerSideProps } from "@/utils/serverSide";
import {
  Accordion,
  Box,
  createStyles,
  Group,
  LoadingOverlay,
  Stack,
  Text,
} from "@mantine/core";
import ProfitLoss from "@/components/Price/ProfitLoss";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";
import { ordersSelector } from "@/store/orders";
import { openPositionsSelector } from "@/store/positions";
import MobileActivePosition from "@/components/mobile/ActivePosition";
import { useLocalStorage } from "@mantine/hooks";
import MobilePendingOrder from "@/components/mobile/PendingOrder";
import { IPosition } from "@/interfaces/IPosition";
import { IOrder } from "@/interfaces/IOrder";
import { motion, AnimatePresence } from "framer-motion";
import MobileActivePositionDetail from "@/components/mobile/MobileActivePositionDetail";
import MobilePendingOrderDetail from "@/components/mobile/MobilePendingOrderDetail";

interface PositionsPageProps {
  assets: IAsset[];
}

const useStyles = createStyles((theme) => ({
  accountRow: {
    zIndex: 1000,
    position: "sticky",
    top: "50px",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[2],
  },

  positionsPanel: {
    background:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[2],
  },
}));

const accordeonStyles = createStyles((theme) => ({
  content: {
    padding: 0,
  },
  control: {
    background:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[2],
  },
}));

const innerAccordeonStyles = createStyles((theme) => ({
  control: {
    ".mantine-Accordion-chevron": {
      marginLeft: 0,
    },
  },
  item: {
    "&:last-child": {
      borderBottom: 0,
    },
  },
}));

const MobilePositionsPage = ({ assets }: PositionsPageProps) => {
  const { user } = useSelector(accountSelector);
  const { classes } = useStyles();
  const allOrders = useSelector(ordersSelector); /* pending or closed */
  const positions = useSelector(openPositionsSelector);
  const completed = [];

  const { classes: accSty } = accordeonStyles();
  const { classes: innerAccSty } = innerAccordeonStyles();

  const pending = allOrders.filter((order) => !order.deletedAt);

  const [accordion, setAccordion] = useLocalStorage<string[]>({
    key: "positions-page",
    defaultValue: [],
    getInitialValueInEffect: true,
  });
  const [positionsAccordion, setPositionsAccordion] = useState<string>("");
  const [pendingAccordion, setPendingAccordion] = useState<string>("");

  const numOpl = parseFloat(user?.total_openProfitLoss);

  const sortPositions = (a: IPosition, b: IPosition) => {
    // Sort by quantity in descending order
    if (b.quantity !== a.quantity) {
      return parseFloat(b.quantity) - parseFloat(a.quantity);
    }

    // If quantities are the same, sort by id in descending order
    return b.id.localeCompare(a.id);
  };

  const sortOrders = (a: IOrder, b: IOrder) => {
    // Sort by quantity in descending order
    if (b.orderQty !== a.orderQty) {
      return parseFloat(b.orderQty) - parseFloat(a.orderQty);
    }

    // If quantities are the same, sort by id in descending order
    return b.id.localeCompare(a.id);
  };

  const [positionManage, setPositionManage] = useState<string | null>(null);
  const [orderManage, setOrderManage] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setInitialLoad(false);
  }, []);

  return (
    <AnimatePresence mode="popLayout">
      {!positionManage && !orderManage && (
        <motion.div
          key="content1"
          initial={{ x: initialLoad ? 0 : "-100vw"}}
          animate={{ x: 0 }}
          exit={{ x: "-100vw" }}

          transition={{ type: "tween", ease: "easeInOut" }}
        >
          <Group
            p={"lg"}
            className={classes.accountRow}
            position={"apart"}
            bg={numOpl > 0 ? "blue.5" : numOpl < 0 ? "red.5" : undefined}
          >
            <Stack spacing={0} align={"center"}>
              <Text size={"xs"} c={numOpl !== 0 ? "white" : "dimmed"}>
                Account
              </Text>
              <Text size={"sm"} c={numOpl !== 0 ? "white" : undefined}>
                {user?.account}
              </Text>
            </Stack>
            <Stack spacing={0} align={"center"}>
              <Text size={"xs"} c={numOpl !== 0 ? "white" : "dimmed"}>
                O/P/L
              </Text>
              <ProfitLoss
                profitLoss={user?.total_openProfitLoss}
                currency={user?.currency}
                weight={"bold"}
                color={"white"}
              />
            </Stack>
            <Stack spacing={0} align={"center"}>
              <Text size={"xs"} c={numOpl !== 0 ? "white" : "dimmed"}>
                Balance
              </Text>
              <ProfitLoss
                profitLoss={user?.total_balance}
                currency={user?.currency}
                weight={"bold"}
                color={"white"}
              />
            </Stack>
          </Group>
          <Accordion
            multiple={true}
            value={accordion}
            onChange={setAccordion}
            classNames={accSty}
          >
            <Accordion.Item value={"positions"}>
              <Box p={0} sx={{ display: "flex", alignItems: "stretch" }}>
                <Accordion.Control disabled={positions.length === 0}>
                  <Text size={"sm"} weight={"bold"}>
                    Active positions ({positions.length})
                  </Text>
                </Accordion.Control>
              </Box>

              <Accordion.Panel p={0}>
                <Accordion
                  style={{ height: "100%" }}
                  multiple={false}
                  classNames={innerAccSty}
                  value={positionsAccordion}
                  onChange={setPositionsAccordion}
                >
                  <LoadingOverlay visible={status === "loading"} />
                  {positions.length > 0 &&
                    [...positions]
                      .sort(sortPositions)
                      .map((position) => (
                        <MobileActivePosition
                          key={position.id}
                          position={{ ...position }}
                          onManage={setPositionManage}
                        />
                      ))}
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value={"pending"} key={`pending-${pending.length}`}>
              <Box p={0} sx={{ display: "flex", alignItems: "stretch" }}>
                <Accordion.Control disabled={pending.length === 0}>
                  <Text size={"sm"} weight={"bold"}>
                    Pending trades ({pending.length})
                  </Text>
                </Accordion.Control>
              </Box>

              <Accordion.Panel p={0}>
                <Accordion
                  value={pendingAccordion}
                  onChange={setPendingAccordion}
                  style={{ height: "100%" }}
                  multiple={false}
                  classNames={innerAccSty}
                >
                  <LoadingOverlay visible={status === "loading"} />
                  {pending.length > 0 &&
                    pending
                      .sort(sortOrders)
                      .map((o) => (
                        <MobilePendingOrder
                          key={o.id}
                          order={o}
                          asset={assets.find((a) => a.symbol === o.symbol)}
                          onManage={setOrderManage}
                        />
                      ))}
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item
              value={"positions"}
              key={`positions-${positions.length}`}
            >
              <Box p={0} sx={{ display: "flex", alignItems: "stretch" }}>
                <Accordion.Control disabled={completed.length === 0}>
                  <Text size={"sm"} weight={"bold"}>
                    Completed
                  </Text>
                </Accordion.Control>
              </Box>

              <Accordion.Panel p={0}>
                <Accordion
                  style={{ height: "100%" }}
                  multiple={true}
                  classNames={innerAccSty}
                >
                  <LoadingOverlay visible={status === "loading"} />
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </motion.div>
      )}
      {positionManage && (
        <motion.div
          key="content2"
          initial={{ x: "100vw" }}
          animate={{ x: 0 }}
          exit={{ x: "100vw" }}
          transition={{ type: "tween", ease: "easeInOut" }}
        >
          <MobileActivePositionDetail
            position={positions.find((p) => p.id === positionManage)}
            onGoBack={() => setPositionManage(null)}
          />
        </motion.div>
      )}
      {orderManage && (
        <motion.div
          key="content3"
          initial={{ x: "100vw" }}
          animate={{ x: 0 }}
          exit={{ x: "100vw" }}
          transition={{ type: "tween", ease: "easeInOut" }}
        >
          <MobilePendingOrderDetail
            order={pending.find((p) => p.id === orderManage)}
            onGoBack={() => setOrderManage(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

MobilePositionsPage.auth = true;

MobilePositionsPage.getLayout = ({ props }) => {
  return (
    <MobileLayout session={props.session} assets={props.assets}>
      <MobilePositionsPage {...props} />
    </MobileLayout>
  );
};

export const getServerSideProps = defaultGetServerSideProps;

export default MobilePositionsPage;
