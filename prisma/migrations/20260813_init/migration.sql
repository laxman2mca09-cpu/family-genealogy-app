CREATE TYPE "RelationshipType" AS ENUM ('PARENT', 'CHILD', 'SPOUSE');

CREATE TABLE "Person" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "gender" TEXT,
  "birthYear" INTEGER,
  "deathYear" INTEGER,
  "birthPlace" TEXT,
  "biography" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Relationship" (
  "id" TEXT NOT NULL,
  "type" "RelationshipType" NOT NULL,
  "fromId" TEXT NOT NULL,
  "toId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Relationship_type_fromId_toId_key" ON "Relationship"("type", "fromId", "toId");
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");
CREATE INDEX "Relationship_fromId_idx" ON "Relationship"("fromId");
CREATE INDEX "Relationship_toId_idx" ON "Relationship"("toId");
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
