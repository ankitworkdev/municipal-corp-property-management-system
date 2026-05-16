ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_photo_thumb_url" TEXT;

ALTER TABLE "media_attachments" ADD COLUMN IF NOT EXISTS "thumbnail_url" TEXT;
