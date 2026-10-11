-- AlterTable: replace single `date` with `startDate`/`endDate`, add `imageUrl`.
-- Existing rows keep their date as startDate; endDate defaults to +2h.
ALTER TABLE "Event" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "imageUrl" TEXT;

UPDATE "Event"
SET "startDate" = "date",
    "endDate" = "date" + INTERVAL '2 hours'
WHERE "startDate" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "endDate" SET NOT NULL;

DROP INDEX "Event_date_idx";
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

ALTER TABLE "Event" DROP COLUMN "date";
