-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `nickname` VARCHAR(16) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `birth` DATE NULL,
    `photo` VARCHAR(127) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `userid_UNIQUE`(`id`),
    UNIQUE INDEX `username_UNIQUE`(`nickname`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`id`, `nickname`, `email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
