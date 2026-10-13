-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "products_isActive_createdAt_idx" ON "products"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "products_isActive_price_idx" ON "products"("isActive", "price");

-- CreateIndex
CREATE INDEX "products_isActive_featured_idx" ON "products"("isActive", "featured");

-- CreateIndex
CREATE INDEX "products_sizes_idx" ON "products" USING GIN ("sizes");

-- CreateIndex
CREATE INDEX "products_colors_idx" ON "products" USING GIN ("colors");
