import React, { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
  screenSize?: `sm` | "md" | "lg" | "xl" | "2xl";
};

const Container = ({ children, className, screenSize = "2xl" }: Props) => (
  <div
    className={`container mx-auto max-w-screen-${screenSize} px-4 ${className}`}
  >
    {children}
  </div>
);

export default Container;
