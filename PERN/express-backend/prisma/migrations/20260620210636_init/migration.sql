-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'DOC', 'OTHER');

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "color" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featured_img_url" TEXT NOT NULL,
    "featured_img_alt" TEXT,
    "featured_img_caption" TEXT,
    "secure_url" TEXT,
    "cloudinary_public_id" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "searchableSnippets" TEXT[],
    "authorName" TEXT NOT NULL,
    "authorBio" TEXT,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "secure_url" TEXT,
    "cloudinary_public_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "original_name" TEXT,
    "mime_type" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "alt_text" TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_isFeatured_idx" ON "BlogCategory"("isFeatured");

-- CreateIndex
CREATE INDEX "BlogCategory_createdAt_idx" ON "BlogCategory"("createdAt");

-- CreateIndex
CREATE INDEX "BlogCategory_name_idx" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_cloudinary_public_id_key" ON "Blog"("cloudinary_public_id");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_status_idx" ON "Blog"("status");

-- CreateIndex
CREATE INDEX "Blog_createdAt_idx" ON "Blog"("createdAt");

-- CreateIndex
CREATE INDEX "Blog_updatedAt_idx" ON "Blog"("updatedAt");

-- CreateIndex
CREATE INDEX "Blog_views_idx" ON "Blog"("views");

-- CreateIndex
CREATE INDEX "Blog_is_featured_idx" ON "Blog"("is_featured");

-- CreateIndex
CREATE INDEX "Blog_categoryId_idx" ON "Blog"("categoryId");

-- CreateIndex
CREATE INDEX "Blog_authorName_idx" ON "Blog"("authorName");

-- CreateIndex
CREATE INDEX "Blog_status_createdAt_idx" ON "Blog"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Media_cloudinary_public_id_key" ON "Media"("cloudinary_public_id");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_created_at_idx" ON "Media"("created_at");

-- CreateIndex
CREATE INDEX "Media_cloudinary_public_id_idx" ON "Media"("cloudinary_public_id");

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
