import { Size, Variant } from "@/interfaces/components";
import { ReactNode, RefObject } from "react";

export type AttrMap = {
  [key: string]: string | number;
};

export type PrimitiveComponentProps = {
  onClick?: (event: any) => void;
  size?: Size;
  variant?: Variant;
  align?: "left" | "right" | "center";
  type?: "button" | "submit" | "link";
  className?: string;
  children?: ReactNode;
  ref?: RefObject<any>;
};
