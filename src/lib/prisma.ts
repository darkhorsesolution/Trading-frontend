import { PrismaClient } from "@prisma/client";

declare global {
  let prisma: PrismaClient | undefined;
}

const prisma =
  (globalThis as any).prisma ||
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
  });

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = prisma;

  // @ts-ignore
  prisma.$on("query", (e) => {
    // @ts-ignore
    //console.log('Query: ' + e.query)
    // @ts-ignore
    //console.log('Q Duration: ' + e.duration + 'ms')
  });
}

export default prisma;
