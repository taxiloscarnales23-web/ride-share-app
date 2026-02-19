CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('rider','driver') NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergencyContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`relationship` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergencyContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidentReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`reportedById` int NOT NULL,
	`reporterType` enum('rider','driver') NOT NULL,
	`incidentType` varchar(100) NOT NULL,
	`description` text,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`status` enum('reported','investigating','resolved','closed') DEFAULT 'reported',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidentReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodeUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promoCodeId` int NOT NULL,
	`riderId` int NOT NULL,
	`rideId` int NOT NULL,
	`discountAmount` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promoCodeUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` varchar(50) NOT NULL,
	`maxUses` int,
	`currentUses` int DEFAULT 0,
	`minRideAmount` varchar(50) DEFAULT '0',
	`expiryDate` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
