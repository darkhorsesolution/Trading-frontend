import { Text, TextProps } from "@mantine/core";
import { ComponentProps } from "../index";

export type FormattedValueProps = {
  digits: number;
  value: number | string;
  suffix?: string;
  calcSize?: boolean;
  formatter?: Intl.NumberFormat;
} & TextProps;

const zeroFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const defaultFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatterAll = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumSignificantDigits: 10,
});

function calculateMinimumWidth(text: string) {
  if (!text) {
    return "auto";
  }
  // Define character and punctuation widths
  const charWidth = 8; // Width of a normal character
  const punctuationWidth = 4; // Width of comma/dot
  const sparePixels = 7; // Extra pixels for spare

  let totalWidth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Check if the character is a comma or dot
    if (char === "," || char === ".") {
      totalWidth += punctuationWidth;
    } else {
      totalWidth += charWidth;
    }
  }

  // Add spare pixels
  totalWidth += sparePixels;

  return totalWidth;
}

export const formatValue = (value: string | number, digits: number): string => {
  const val = typeof value === "string" ? parseFloat(value) : value;
  let formatted: string;

  if (digits === -1 || digits === 3) {
    formatted = formatterAll.format(val);
  } else if (digits === 0) {
    formatted = zeroFormatter.format(val);
  } else {
    formatted = defaultFormatter.format(val);
  }

  return formatted;
};

const FormattedValue = ({
  value,
  digits,
  suffix,
  className,
  style,
  w,
  calcSize,
  formatter,
  ...rest
}: FormattedValueProps) => {
  const val = typeof value === "string" ? parseFloat(value) : value;
  let formatted: string;

  if (isNaN(val)) {
    return null
  }   
  
  if (!formatter) {
 
    /* format by some default rules? */
    if (digits === -1 || digits === 3) {
      formatted = formatterAll.format(val);
    } else if (digits === 0) {
      formatted = zeroFormatter.format(val);
    } else {
      formatted = defaultFormatter.format(val);
    }

  } else {
    formatted = formatter.format(val);
  }

  const styleObject = { marginLeft: val < 0 ? "-5px" : 0, ...style };
  if (calcSize) {
    styleObject.minWidth = calculateMinimumWidth(formatted);
  }

  return (
    <Text
      className={className}
      style={styleObject}
      w={w}
      variant={"price"}
      {...rest}
    >
      {formatted}
      {suffix ? ` ${suffix}` : ""}
    </Text>
  );
};

export default FormattedValue;
