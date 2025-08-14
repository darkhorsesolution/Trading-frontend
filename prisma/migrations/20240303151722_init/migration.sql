-- CreateEnum
CREATE TYPE "log_event" AS ENUM ('notification', 'connected', 'disconnected', 'submission', 'modification', 'execution', 'rejection');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "ticket" TEXT,
    "account" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT,
    "limitPrice" TEXT,
    "stopPrice" TEXT,
    "clOrderLinkId" TEXT,
    "origClOrderId" TEXT,
    "cumQty" TEXT,
    "lastQty" TEXT,
    "orderQty" TEXT,
    "lastPrice" TEXT,
    "commission" TEXT,
    "timeInForce" TEXT,
    "ocoId" TEXT,
    "stopLossPips" INTEGER,
    "stopLossPipsChange" TEXT,
    "stopLoss" TEXT,
    "trailingStopLoss" TEXT,
    "takeProfitPips" INTEGER,
    "takeProfitPipsChange" TEXT,
    "takeProfit" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "executionTime" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "trigger" TEXT NOT NULL DEFAULT 'mkt',
    "direct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quotesRate" REAL DEFAULT 500,
    "pollingRate" REAL DEFAULT 5000,
    "watchedAssets" JSON DEFAULT '[{"symbol":"EURUSD","index":0}]',
    "workspaces" JSON,
    "syncWorkspaces" BOOLEAN NOT NULL DEFAULT true,
    "sounds" BOOLEAN NOT NULL DEFAULT true,
    "tableRowDblClick" BOOLEAN NOT NULL DEFAULT false,
    "directOrders" BOOLEAN NOT NULL DEFAULT false,
    "defaultLotSizeFx" INTEGER DEFAULT 1000,
    "defaultLotSizeCfd" DOUBLE PRECISION DEFAULT 0.1,
    "defaultLotSizeMetals" DOUBLE PRECISION DEFAULT 10,
    "twoFactorUrl" TEXT,
    "twoFactorBase32" TEXT,
    "forexAssets" BOOLEAN NOT NULL DEFAULT true,
    "metalsAssets" BOOLEAN NOT NULL DEFAULT true,
    "indicesAssets" BOOLEAN NOT NULL DEFAULT true,
    "energiesAssets" BOOLEAN NOT NULL DEFAULT true,
    "cryptoAssets" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "side" TEXT,
    "account" TEXT NOT NULL,
    "symbol" TEXT,
    "tradeDate" TEXT,
    "transactTime" TIMESTAMPTZ(6),
    "orderId" TEXT,
    "clOrderId" TEXT,
    "currency" TEXT,
    "commission" TEXT,
    "settledPL" TEXT,
    "swaps" TEXT,
    "price" TEXT,
    "quantity" TEXT,
    "clearingBusinessDate" TEXT,
    "tradeLinkId" TEXT,
    "hedged" BOOLEAN NOT NULL DEFAULT false,
    "stopLoss" TEXT,
    "trailingStopLoss" TEXT,
    "takeProfit" TEXT,
    "stopLossTrigger" TEXT,
    "takeProfitTrigger" TEXT,
    "lastAsk" TEXT,
    "lastBid" TEXT,
    "lastCounterPrice" TEXT,
    "trigger" TEXT,
    "direct" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "currency" TEXT,
    "moneyType" TEXT,
    "moneyAmt" TEXT,
    "text" TEXT,
    "dateOfInterest" BIGINT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "account" TEXT,
    "type" TEXT NOT NULL,
    "event" "log_event",
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "group" TEXT,
    "location" TEXT,
    "ip" TEXT,
    "raw" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "account" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "status" VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "email" VARCHAR,
    "phone" VARCHAR,
    "accountType" TEXT NOT NULL,
    "dob" INTEGER,
    "currency" TEXT,
    "masterId" TEXT,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "hedged" BOOLEAN NOT NULL DEFAULT false,
    "institutional" BOOLEAN NOT NULL DEFAULT false,
    "platform" TEXT NOT NULL DEFAULT '',
    "total_balance" TEXT NOT NULL DEFAULT '0',
    "total_netEquity" TEXT NOT NULL DEFAULT '0',
    "total_profitLoss" TEXT NOT NULL DEFAULT '0',
    "total_openProfitLoss" TEXT NOT NULL DEFAULT '0',
    "total_deposit" TEXT NOT NULL DEFAULT '0',
    "total_withdrawal" TEXT NOT NULL DEFAULT '0',
    "total_fees" TEXT NOT NULL DEFAULT '0',
    "total_adjustment" TEXT NOT NULL DEFAULT '0',
    "total_commission" TEXT NOT NULL DEFAULT '0',
    "total_rollover" TEXT NOT NULL DEFAULT '0',
    "total_dividend" TEXT NOT NULL DEFAULT '0',
    "total_mtmpl" TEXT NOT NULL DEFAULT '0',
    "daily_date" TEXT NOT NULL DEFAULT '',
    "daily_openBalance" TEXT NOT NULL DEFAULT '0',
    "daily_closeBalance" TEXT NOT NULL DEFAULT '0',
    "daily_netEquity" TEXT NOT NULL DEFAULT '0',
    "daily_profitLoss" TEXT NOT NULL DEFAULT '0',
    "daily_openProfitLoss" TEXT NOT NULL DEFAULT '0',
    "daily_deposit" TEXT NOT NULL DEFAULT '0',
    "daily_withdrawal" TEXT NOT NULL DEFAULT '0',
    "daily_fees" TEXT NOT NULL DEFAULT '0',
    "daily_adjustment" TEXT NOT NULL DEFAULT '0',
    "daily_commission" TEXT NOT NULL DEFAULT '0',
    "daily_rollover" TEXT NOT NULL DEFAULT '0',
    "daily_dividend" TEXT NOT NULL DEFAULT '0',
    "daily_mtmpl" TEXT NOT NULL DEFAULT '0',
    "marginPercentage" TEXT NOT NULL DEFAULT '0',
    "creditLimit" TEXT NOT NULL DEFAULT '0',
    "creditUsage" TEXT NOT NULL DEFAULT '0',
    "creditAvailable" TEXT NOT NULL DEFAULT '0',
    "creditUsagePercent" TEXT NOT NULL DEFAULT '0',
    "availableMargin" TEXT NOT NULL DEFAULT '0',
    "lastMessageSeen" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("account")
);

-- CreateTable
CREATE TABLE "account_snapshots" (
    "account" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "balance" TEXT NOT NULL,
    "netEquity" TEXT NOT NULL,
    "profitLoss" TEXT NOT NULL,
    "openProfitLoss" TEXT NOT NULL,
    "deposit" TEXT,
    "withdrawal" TEXT,
    "fees" TEXT,
    "adjustment" TEXT,
    "commission" TEXT,
    "rollover" TEXT,
    "dividend" TEXT,
    "mtmpl" TEXT,
    "marginPercentage" TEXT,
    "creditLimit" TEXT,
    "creditUsage" TEXT,
    "creditUsagePercent" TEXT,
    "availableMargin" TEXT,

    CONSTRAINT "account_snapshots_pkey" PRIMARY KEY ("account","time")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "pubDate" VARCHAR(300) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "link" VARCHAR(300) NOT NULL,
    "pair" VARCHAR(500) NOT NULL,
    "provider" VARCHAR(120) NOT NULL,
    "market" VARCHAR(120) NOT NULL,
    "headline" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "dateUtc" TIMESTAMP(3) NOT NULL,
    "periodDateUtc" TIMESTAMP(3),
    "periodType" TEXT,
    "actual" DOUBLE PRECISION,
    "revised" DOUBLE PRECISION,
    "consensus" DOUBLE PRECISION,
    "ratioDeviation" DOUBLE PRECISION,
    "previous" DOUBLE PRECISION,
    "isBetterThanExpected" BOOLEAN,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "unit" TEXT,
    "potency" TEXT,
    "volatility" TEXT NOT NULL,
    "isAllDay" BOOLEAN,
    "isTentative" BOOLEAN,
    "isPreliminary" BOOLEAN,
    "isReport" BOOLEAN,
    "isSpeech" BOOLEAN,
    "lastUpdated" INTEGER NOT NULL,
    "previousIsPreliminary" BOOLEAN,
    "details" JSONB,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_ocoId_key" ON "orders"("ocoId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_ticket_key" ON "orders"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "settings_userId_key" ON "settings"("userId");

-- CreateIndex
CREATE INDEX "trades_account_idx" ON "trades"("account");

-- CreateIndex
CREATE INDEX "logs_group_idx" ON "logs"("group");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_userId_key" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_key" ON "users"("account");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "createdAt" ON "articles"("createdAt");

-- CreateIndex
CREATE INDEX "eventId_idx" ON "calendar_events"("eventId");

-- CreateIndex
CREATE INDEX "dateUtc" ON "calendar_events"("dateUtc");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_fkey" FOREIGN KEY ("account") REFERENCES "users"("account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ocoId_fkey" FOREIGN KEY ("ocoId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_fkey" FOREIGN KEY ("account") REFERENCES "users"("account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_fkey" FOREIGN KEY ("account") REFERENCES "users"("account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_account_fkey" FOREIGN KEY ("account") REFERENCES "users"("account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "users"("account") ON DELETE CASCADE ON UPDATE CASCADE;
