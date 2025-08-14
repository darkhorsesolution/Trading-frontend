import React, { forwardRef, useMemo } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type PageTransitionProps = HTMLMotionProps<"div">;
type PageTransitionRef = React.ForwardedRef<HTMLDivElement>;
export type IndexPageRef = React.ForwardedRef<HTMLDivElement>;
function PageTransition(
  { children, ...rest }: PageTransitionProps,
  ref: PageTransitionRef
) {
  const onTheRight = { x: "100%" };
  const inTheCenter = { x: 0 };
  const onTheLeft = { x: "-100%", position: "absolute" } as any;

  const transition = { duration: 0.2, ease: "easeInOut" };

  return (
    <motion.div
      ref={ref}
      initial={onTheRight}
      animate={inTheCenter}
      exit={onTheLeft}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default forwardRef(PageTransition);
