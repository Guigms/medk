

-- CreateTable
CREATE TABLE `store_config` (
    `id` VARCHAR(191) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'Farmácia Medk',
    `moduleCommissions` BOOLEAN NOT NULL DEFAULT false,
    `moduleMargin` BOOLEAN NOT NULL DEFAULT false,
    `moduleTurnover` BOOLEAN NOT NULL DEFAULT false,
    `moduleAbcCurve` BOOLEAN NOT NULL DEFAULT false,
    `moduleXmlImport` BOOLEAN NOT NULL DEFAULT false,
    `moduleSeasonality` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `orders_orderNumber_key` ON `orders`(`orderNumber`);
