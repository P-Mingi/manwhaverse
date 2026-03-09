-- Affiliate Store Migration
-- Adds: ProductType enum, ManhwaProduct, ProductLink, ProductWishlist, AffiliateClick

CREATE TYPE "ProductType" AS ENUM (
  'PHYSICAL_MANGA',
  'BOX_SET',
  'LIGHT_NOVEL',
  'FIGURINE',
  'ARTBOOK',
  'POSTER',
  'GOODS'
);

CREATE TABLE "ManhwaProduct" (
  "id"               TEXT NOT NULL,
  "manhwa_id"        TEXT NOT NULL,
  "type"             "ProductType" NOT NULL,
  "title_en"         TEXT NOT NULL,
  "title_fr"         TEXT,
  "cover_url"        TEXT,
  "language"         TEXT,
  "price_amount"     DOUBLE PRECISION,
  "price_currency"   TEXT,
  "price_updated_at" TIMESTAMP(3),
  "asin"             TEXT,
  "isbn"             TEXT,
  "ean"              TEXT,
  "is_featured"      BOOLEAN NOT NULL DEFAULT false,
  "position"         INTEGER NOT NULL DEFAULT 0,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ManhwaProduct_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ManhwaProduct_manhwa_id_fkey" FOREIGN KEY ("manhwa_id") REFERENCES "Manhwa"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ManhwaProduct_manhwa_id_type_idx" ON "ManhwaProduct"("manhwa_id", "type");
CREATE INDEX "ManhwaProduct_type_is_featured_idx" ON "ManhwaProduct"("type", "is_featured");
CREATE INDEX "ManhwaProduct_asin_idx" ON "ManhwaProduct"("asin");

CREATE TABLE "ProductLink" (
  "id"               TEXT NOT NULL,
  "product_id"       TEXT NOT NULL,
  "marketplace_id"   TEXT NOT NULL,
  "url"              TEXT NOT NULL,
  "price_amount"     DOUBLE PRECISION,
  "price_currency"   TEXT,
  "price_updated_at" TIMESTAMP(3),
  "is_available"     BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "ProductLink_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductLink_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ManhwaProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductLink_product_id_marketplace_id_key" UNIQUE ("product_id", "marketplace_id")
);

CREATE INDEX "ProductLink_marketplace_id_idx" ON "ProductLink"("marketplace_id");

CREATE TABLE "ProductWishlist" (
  "user_id"    TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductWishlist_pkey" PRIMARY KEY ("user_id", "product_id"),
  CONSTRAINT "ProductWishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ProductWishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ManhwaProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductWishlist_user_id_created_at_idx" ON "ProductWishlist"("user_id", "created_at" DESC);

CREATE TABLE "AffiliateClick" (
  "id"         TEXT NOT NULL,
  "user_id"    TEXT,
  "manhwa_id"  TEXT NOT NULL,
  "product_id" TEXT,
  "platform"   TEXT NOT NULL,
  "url"        TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AffiliateClick_manhwa_id_platform_idx" ON "AffiliateClick"("manhwa_id", "platform");
CREATE INDEX "AffiliateClick_created_at_idx" ON "AffiliateClick"("created_at" DESC);
