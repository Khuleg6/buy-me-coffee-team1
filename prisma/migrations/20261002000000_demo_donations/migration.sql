ALTER TABLE "Donation" ALTER COLUMN "donorId" DROP NOT NULL;
ALTER TABLE "Donation" ADD COLUMN "transactionId" TEXT;
CREATE UNIQUE INDEX "Donation_transactionId_key" ON "Donation"("transactionId");
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD COLUMN "recipientId" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "donorId" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "specialMessage" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Transaction" ADD COLUMN "socialURLOrBuyMeCoffee" TEXT NOT NULL DEFAULT '';
