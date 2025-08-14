import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  createStyles,
} from "@mantine/core";
import TpSlInputs, {
  InputActivated,
  TpSlType,
  TpSlValues,
} from "../Order/TpSlInputs";
import CurrentPrice from "../Order/CurrentPrice";
import FormattedValue from "../Price/FormattedValue";
import { OrderSide } from "@/interfaces/IOrder";
import { closePosition, modifyPosition } from "@/store/positions";
import { ITradeModify } from "@/interfaces/IPosition";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/pages/_app";
import { symbolQuoteSelector } from "@/store/quotes";
import { ITrade } from "@/interfaces/ITrade";
import { setFloatingTradePanel } from "@/store/workspace";
import { getSidePrice } from "@/utils/utils";
import { assetsState } from "@/store/assets";
import { modals } from "@mantine/modals";
import { Modals } from "../Modals";

const useStyles = createStyles((theme) => ({
  mobile: {
    button: {
      fontWeight: 500,
    },
  },
  boxrow: {
    display: "flex",
    alignItems: "center",
    label: {
      display: "block",
    },
    gap: ".5rem",
  },
}));

export interface TradePanelProps {
  trade: ITrade;
  mobile: boolean;
  onUpdate: () => void;
}

const TradePanel = ({ trade, mobile, onUpdate }: TradePanelProps) => {
  const dispatch = useAppDispatch();
  const { assets } = assetsState;
  const asset = assets.find((a) => a.symbol === trade.symbol);

  const quote = useSelector(symbolQuoteSelector(asset.symbol));
  const t = trade;
  const { classes } = useStyles();
  const [dirty, setDirty] = useState(false);
  const [sl, setSl] = useState(TpSlValues.fromTrade(t, TpSlType.SL));
  const [tp, setTp] = useState(TpSlValues.fromTrade(t, TpSlType.TP));
  const [busy, setBusy] = useState(false);
  const [lastActiveInput, setLastActiveInput] = useState<InputActivated | null>(
    null
  );
  const [tpslKey, setTpSlKey] = useState(0); // required so tpsl is rerendered with outside value (price)

  async function modifyTradeWrapper() {
    const modifyData: ITradeModify = {
      id: t.orderId,
    };

    sl.fillData(modifyData, TpSlType.SL);
    tp.fillData(modifyData, TpSlType.TP);

    setBusy(true);
    await dispatch(modifyPosition(modifyData));
    setBusy(false);
    dispatch(setFloatingTradePanel(null));
    if (onUpdate) {
      onUpdate();
    }
  }

  async function closeTradeWrapper() {
    if (mobile) {
      modals.openContextModal({
        centered: true,
        modal: Modals.ConfirmModal,
        title: "Close?",
        innerProps: {
          onConfirm: async () => {
            await dispatch(closePosition(trade.orderId));
            if (onUpdate) {
              onUpdate();
            }
            modals.closeAll();
          },
        },
      });
    } else {
      setBusy(true);
      await dispatch(closePosition(trade.orderId));
      setBusy(false);
      dispatch(setFloatingTradePanel(null));
      if (onUpdate) {
        onUpdate();
      }
    }
  }

  return (
    <>
      {!mobile && (
        <>
          <Box className={classes.boxrow}>
            <Box>
              <Text style={{ flex: "1" }} size={"sm"}>
                {asset ? asset.name : ""}
              </Text>
              {t.side === OrderSide.SELL ? (
                <Badge color="red">Sell</Badge>
              ) : (
                <Badge color="green">Buy</Badge>
              )}
            </Box>
            <Box display={"flex"} style={{ gap: "0.5rem" }}>
              <Box>
                <Text size={"sm"}>Volume</Text>
                <FormattedValue digits={-1} value={t.quantity} />
              </Box>
            </Box>
            <CurrentPrice
              label="Current Price"
              value={getSidePrice(t.side, quote)}
              side={t.side}
              onClick={(val) => {
                if (lastActiveInput === InputActivated.SL) {
                  setSl(
                    new TpSlValues(
                      parseFloat(val),
                      sl.pips,
                      sl.pipsChange,
                      true
                    )
                  );
                } else if (lastActiveInput === InputActivated.TP) {
                  setTp(
                    new TpSlValues(
                      parseFloat(val),
                      tp.pips,
                      tp.pipsChange,
                      true
                    )
                  );
                }
                setDirty(true);
                setTpSlKey(tpslKey + 1);
              }}
              sideSuffix={false}
              smallerLastLetters={asset.smallerDigits}
            />
          </Box>
          <Divider />
        </>
      )}
      <Stack>
        <TpSlInputs
          side={t.side}
          key={tpslKey}
          precision={asset.pricePrecision}
          tpValue={tp}
          slValue={sl}
          tpOnChange={(val) => {
            setTp(val);
            setDirty(true);
          }}
          slOnChange={(val) => {
            setSl(val);
            setDirty(true);
          }}
          onClickInput={setLastActiveInput}
          price={parseFloat(t.price)}
        />
      </Stack>

      <Flex
        pos={"relative"}
        gap={"md"}
        wrap={"wrap"}
        className={mobile ? classes.mobile : undefined}
      >
        <LoadingOverlay visible={busy} />
        <Button
          disabled={!dirty}
          onClick={modifyTradeWrapper}
          style={mobile ? undefined : { flex: 1 }}
          size={mobile ? "sm" : undefined}
          display={mobile ? undefined: "inline-block"}
          w={mobile? "100%" : undefined}
        >
          Modify
        </Button>
        <Button
          color="red"
          style={mobile ? undefined : { flex: 1 }}
          display={mobile ? undefined: "inline-block"}
          size={mobile ? "sm" : undefined}
          onClick={closeTradeWrapper}
          w={mobile? "100%" : undefined}
        >
          Close Position
        </Button>
      </Flex>
    </>
  );
};

export default TradePanel;
