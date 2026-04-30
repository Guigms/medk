/*
  Warnings:

  - A unique constraint covering the columns `[purchaseBarcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `conversionFactor` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `purchaseBarcode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `products_purchaseBarcode_key` ON `products`(`purchaseBarcode`);
