CREATE TABLE IF NOT EXISTS `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `online` BOOLEAN NOT NULL DEFAULT 0,
    `location` VARCHAR(100) NULL DEFAULT NULL,
    `name` VARCHAR(25) NULL DEFAULT NULL,
    `username` VARCHAR(25) NULL DEFAULT NULL,
    `password` VARCHAR(100) NULL DEFAULT NULL,
    `email` VARCHAR(25) NULL DEFAULT NULL,
    PRIMARY KEY(`id`),
    UNIQUE (`username`)
);

CREATE TABLE IF NOT EXISTS `Events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventname` VARCHAR(25) NULL DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `event_id` INTEGER NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`user_id`) REFERENCES Users(`id`),
    FOREIGN KEY(`event_id`) REFERENCES Events(`id`)
);

CREATE TABLE IF NOT EXISTS `Messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `author_id` INTEGER NOT NULL,
    `message` MEDIUMTEXT NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`event_id`) REFERENCES Events(`id`),
    FOREIGN KEY(`author_id`) REFERENCES Users(`id`)
);

CREATE TABLE IF NOT EXISTS `Friends` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `friend_id` INTEGER NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`user_id`) REFERENCES Users(`id`),
    FOREIGN KEY(`friend_id`) REFERENCES Users(`id`)
);
