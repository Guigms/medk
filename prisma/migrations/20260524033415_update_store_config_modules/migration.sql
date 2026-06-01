-- AlterTable
ALTER TABLE `store_config` ADD COLUMN `moduleNfeReport` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `moduleXmlImport` BOOLEAN NOT NULL DEFAULT true;
