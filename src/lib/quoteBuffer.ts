import { IPriceTick } from "@/interfaces/IOrder";

declare global {
  // eslint-disable-next-line no-var
  var QuoteBuffer: { [key: string]: IPriceTick } | undefined;
}

const QuoteBuffer = globalThis.QuoteBuffer || {};

export default QuoteBuffer;
