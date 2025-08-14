import { ComponentProps } from "@/components";
import ValueWithCurrency from "@/components/Price/ValueWithCurrency";
import { useSelector } from "react-redux";
import { accountSelector } from "@/store/account";
import Constants from "@/utils/Constants";
import { Box, createStyles, Input, Kbd } from "@mantine/core";
import { useRef } from "react";

export type EditableCellFieldProps = {
  value: number | any;
  currency: string;
  editable: boolean;
  setEditable: (boolean) => void;
  onChange: (string) => void;
} & ComponentProps;

const useStyles = createStyles((theme) => ({
  expanded: {
    position: "absolute",
    top: 2,
    left: 0,
  },
  notexpanded: {
    cursor: "pointer",
  },
}));

const EditableCellField = ({
  value,
  currency,
  editable,
  setEditable,
  onChange,
}: EditableCellFieldProps) => {
  const { classes } = useStyles();
  const inputFieldRef = useRef(null);

  return (
    <Box
      className={editable ? classes.expanded : classes.notexpanded}
      onClick={() => setEditable(true)}
    >
      {editable ? (
        <Input
          size={"xs"}
          ref={inputFieldRef}
          onBlur={() => setTimeout(() => setEditable(false), 500)}
          rightSection={
            <Kbd
              px={"sm"}
              onClick={() => {
                onChange(inputFieldRef.current.value);
              }}
            >
              ⏎
            </Kbd>
          }
          type={"number"}
          defaultValue={value}
        />
      ) : value ? (
        <ValueWithCurrency
          value={parseFloat(value)}
          currency={currency}
          precision={Constants.ProfitLossValuePrecision}
        />
      ) : (
        "-"
      )}
    </Box>
  );
};

export default EditableCellField;
