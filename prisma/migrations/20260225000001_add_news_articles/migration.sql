-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "pubDate" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artistImageUrl" TEXT,
    "genre" TEXT,
    "keyword" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_link_key" ON "NewsArticle"("link");

-- CreateIndex
CREATE INDEX "NewsArticle_fetchedAt_idx" ON "NewsArticle"("fetchedAt");

-- CreateIndex
CREATE INDEX "NewsArticle_link_idx" ON "NewsArticle"("link");
