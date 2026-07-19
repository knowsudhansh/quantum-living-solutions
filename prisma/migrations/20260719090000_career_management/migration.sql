ALTER TABLE "career_applications"
  ADD COLUMN "position_slug" VARCHAR(120) NOT NULL DEFAULT 'other-opportunities',
  ADD COLUMN "source" VARCHAR(50) NOT NULL DEFAULT 'CAREERS',
  ADD COLUMN "location" VARCHAR(255),
  ADD COLUMN "experience_years" INTEGER,
  ADD COLUMN "current_company" VARCHAR(255),
  ADD COLUMN "portfolio_url" VARCHAR(512),
  ADD COLUMN "linkedin_url" VARCHAR(512),
  ADD COLUMN "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "availability" VARCHAR(100),
  ADD COLUMN "resume_file_name" VARCHAR(255),
  ADD COLUMN "resume_mime_type" VARCHAR(120),
  ADD COLUMN "resume_size" INTEGER,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "career_applications_email_idx" ON "career_applications"("email");
CREATE INDEX "career_applications_role_idx" ON "career_applications"("role");
CREATE INDEX "career_applications_position_slug_idx" ON "career_applications"("position_slug");
CREATE INDEX "career_applications_status_idx" ON "career_applications"("status");
