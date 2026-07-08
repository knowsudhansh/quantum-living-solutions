-- CreateTable
CREATE TABLE "demo_slots" (
    "id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "max_capacity" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "demo_slots_pkey" PRIMARY KEY ("id")
);

-- AddCheckConstraints
ALTER TABLE "demo_slots"
ADD CONSTRAINT "check_duration"
CHECK ("end_time" > "start_time");

ALTER TABLE "demo_slots"
ADD CONSTRAINT "check_max_capacity"
CHECK ("max_capacity" > 0);

-- CreateIndex
CREATE INDEX "idx_demo_slots_start_time" ON "demo_slots"("start_time");