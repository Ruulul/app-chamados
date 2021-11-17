/*
  Warnings:

  - You are about to drop the column `autorId` on the `chamado` table. All the data in the column will be lost.
  - You are about to drop the column `autorId` on the `mensagem` table. All the data in the column will be lost.
  - Added the required column `autor` to the `Chamado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autor` to the `Mensagem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chamado` DROP FOREIGN KEY `Chamado_autorId_fkey`;

-- DropForeignKey
ALTER TABLE `mensagem` DROP FOREIGN KEY `Mensagem_autorId_fkey`;

-- AlterTable
ALTER TABLE `chamado` DROP COLUMN `autorId`,
    ADD COLUMN `autor` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `mensagem` DROP COLUMN `autorId`,
    ADD COLUMN `autor` VARCHAR(191) NOT NULL;
