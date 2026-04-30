-- AlterTable
ALTER TABLE `orders` ADD COLUMN `sellerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `commissionRate` DECIMAL(5, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `commission_records` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `percentage` DECIMAL(5, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `commission_records_orderId_key`(`orderId`),
    INDEX `commission_records_sellerId_idx`(`sellerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_records` ADD CONSTRAINT `commission_records_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_records` ADD CONSTRAINT `commission_records_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
