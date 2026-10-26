-- CreateTable
CREATE TABLE "Stand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PriceCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "priceAgorot" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gate" TEXT NOT NULL,
    "onSale" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Section_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Section_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PriceCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    CONSTRAINT "Seat_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "kickoff" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeatHold" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "seatId" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeatHold_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeatHold_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "matchId" TEXT,
    "totalAgorot" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "seatId" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "priceAgorot" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeasonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceAgorot" INTEGER NOT NULL,
    "categoryIds" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SeasonTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "seatId" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeasonTicket_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SeasonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeasonTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeasonTicket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Section_standId_idx" ON "Section"("standId");

-- CreateIndex
CREATE INDEX "Section_categoryId_idx" ON "Section"("categoryId");

-- CreateIndex
CREATE INDEX "Seat_sectionId_idx" ON "Seat"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_sectionId_row_number_key" ON "Seat"("sectionId", "row", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- CreateIndex
CREATE INDEX "Match_kickoff_idx" ON "Match"("kickoff");

-- CreateIndex
CREATE INDEX "SeatHold_buyerId_matchId_idx" ON "SeatHold"("buyerId", "matchId");

-- CreateIndex
CREATE INDEX "SeatHold_matchId_sectionId_idx" ON "SeatHold"("matchId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatHold_matchId_seatId_key" ON "SeatHold"("matchId", "seatId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");

-- CreateIndex
CREATE INDEX "Ticket_buyerId_idx" ON "Ticket"("buyerId");

-- CreateIndex
CREATE INDEX "Ticket_matchId_sectionId_idx" ON "Ticket"("matchId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_matchId_seatId_key" ON "Ticket"("matchId", "seatId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonTicket_code_key" ON "SeasonTicket"("code");

-- CreateIndex
CREATE INDEX "SeasonTicket_season_sectionId_idx" ON "SeasonTicket"("season", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonTicket_season_seatId_key" ON "SeasonTicket"("season", "seatId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonTicket_season_buyerId_key" ON "SeasonTicket"("season", "buyerId");
