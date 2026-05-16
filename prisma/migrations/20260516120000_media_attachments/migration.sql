-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_photo_url" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "media_attachments" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "media_attachments_entity_type_entity_id_idx" ON "media_attachments"("entity_type", "entity_id");
