-- AlterTable
ALTER TABLE `batches` ADD COLUMN `nfeId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `batches_nfeId_idx` ON `batches`(`nfeId`);

-- AddForeignKey
ALTER TABLE `batches` ADD CONSTRAINT `batches_nfeId_fkey` FOREIGN KEY (`nfeId`) REFERENCES `nfe_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
