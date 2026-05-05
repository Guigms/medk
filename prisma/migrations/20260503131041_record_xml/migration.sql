-- CreateTable
CREATE TABLE `nfe_records` (
    `id` VARCHAR(191) NOT NULL,
    `accessKey` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `series` VARCHAR(191) NULL,
    `issuerName` VARCHAR(191) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `totalValue` DECIMAL(10, 2) NOT NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `nfe_records_accessKey_key`(`accessKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
