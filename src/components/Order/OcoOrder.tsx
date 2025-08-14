import {
  AllowedOCOTypes,
  IPriceTick,
  OrderSides,
  OrderSide,
  OrderType,
} from "@/interfaces/IOrder";
import { IAsset } from "@/interfaces/IAsset";
import {
  Box,
  Flex,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import CurrentPrice from "./CurrentPrice";
import { IUser } from "@/interfaces/account";
import FormattedValue from "../Price/FormattedValue";
import { getOrderCreateSidePrice } from "@/utils/utils";
import ResponsiveNumberInput from "@/components/ResponsiveNumberInput";

export interface OcoData {
  side: OrderSide;
  type: OrderType;
  price: number;
}

interface OcoGroupProps {
  mobile?: boolean;
  classNames: string;
  onChange: (data: OcoData) => void;
  asset: IAsset;
  quote: IPriceTick;
  i: number;
  val: OcoData;
}

const OcoGroup = ({
  mobile,
  onChange,
  asset,
  quote,
  i,
  val,
  classNames,
}: OcoGroupProps) => {
  const [price, setPrice] = useState<number | "">(val.price);
  const [type, setType] = useState<OrderType>(val.type);
  const [side, setSide] = useState<OrderSide>(val.side);
  const [quotePrice, setQuotePrice] = useState<number>(0);

  useEffect(() => {
    onChange({
      price: price || 0,
      side,
      type,
    });
  }, [type, price, side]);

  useEffect(() => {
    setQuotePrice(getOrderCreateSidePrice(side, quote));
  }, [side, quote]);

  const content = (
    <Group noWrap={true} className={classNames}>
      <Text>{i}</Text>
      <SegmentedControl
        color={"green"}
        data={OrderSides}
        defaultValue={side}
        onChange={(newvalue) => setSide(newvalue as OrderSide)}
      />
      <SegmentedControl
        data={AllowedOCOTypes}
        defaultValue={type}
        onChange={(e) => setType(e as OrderType)}
      />
      <Flex align={"center"} gap={"md"}>
        <Text c={"dimmed"} size={"sm"}>
          @&nbsp;price
        </Text>

        <ResponsiveNumberInput
          min={0}
          step={1 / Math.pow(10, asset.pricePrecision)}
          precision={asset.pricePrecision}
          defaultValue={price}
          onChange={setPrice}
          w={130}
        />
      </Flex>
      <CurrentPrice
        value={quotePrice}
        label="Current Price"
        side={side}
        sideSuffix={true}
        smallerLastLetters={asset.smallerDigits}
      />
    </Group>
  );

  return mobile ? (
    <ScrollArea type="always" pb={"md"}>
      {content}
    </ScrollArea>
  ) : (
    content
  );
};

interface MarginImpactProps {
  volume: number;
  label: string;
  account: IUser;
}

const MarginImpact = ({ account, volume, label }: MarginImpactProps) => {
  return (
    <Box>
      <Text size="sm">{label}</Text>
      <FormattedValue
        digits={2}
        value={volume / (100 / parseFloat(account.marginPercentage))}
        suffix={"USD"}
      />
    </Box>
  );
};

interface OcoProps {
  mobile?: boolean;
  classes: { [key in keyof any]: string };
  asset: IAsset;
  quote: IPriceTick;
  setOco1: React.Dispatch<React.SetStateAction<OcoData>>;
  setOco2: React.Dispatch<React.SetStateAction<OcoData>>;
  oco1: OcoData;
  oco2: OcoData;
  volume: number;
  user: IUser;
}

const OcoOrder = ({
  mobile,
  classes,
  asset,
  quote,
  setOco1,
  setOco2,
  oco1,
  oco2,
  volume,
  user,
}: OcoProps) => {
  return (
    <Box display={"flex"} w={"100%"}>
      {!mobile && <span className={classes.grouping}></span>}
      <Stack w={"100%"}>
        <OcoGroup
          mobile={mobile}
          classNames={classes.ocoGroup}
          asset={asset}
          quote={quote}
          onChange={setOco1}
          i={1}
          val={oco1}
        />
        <OcoGroup
          mobile={mobile}
          classNames={classes.ocoGroup}
          asset={asset}
          quote={quote}
          onChange={setOco2}
          i={2}
          val={oco2}
        />
        <Group spacing={"xl"}>
          <MarginImpact
            label="Margin Impact 1"
            volume={volume || 0}
            account={user}
          />
          <MarginImpact
            label="Margin Impact 2"
            volume={volume || 0}
            account={user}
          />
        </Group>
      </Stack>
    </Box>
  );
};

export default OcoOrder;
