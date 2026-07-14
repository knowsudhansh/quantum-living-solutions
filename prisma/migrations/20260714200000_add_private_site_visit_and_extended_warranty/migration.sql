-- Add the business intake fields required for private site visits.
ALTER TABLE "bookings"
ADD COLUMN "automation_category" VARCHAR(100) NOT NULL DEFAULT 'Home Automation',
ADD COLUMN "automation_selections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "creative_requirement" TEXT,
ADD COLUMN "location" VARCHAR(255) NOT NULL DEFAULT '';

-- Add the public extended-warranty availability flag to products.
ALTER TABLE "products"
ADD COLUMN "extended_warranty_available" BOOLEAN NOT NULL DEFAULT false;
