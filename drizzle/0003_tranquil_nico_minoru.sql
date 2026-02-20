CREATE TABLE `disputeEvidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disputeId` int NOT NULL,
	`evidenceType` enum('photo','video','audio','document') NOT NULL,
	`fileUrl` text NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disputeEvidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disputeResolutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disputeId` int NOT NULL,
	`resolutionType` enum('refund','credit','compensation','no_action') NOT NULL,
	`amount` varchar(50),
	`reason` text,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disputeResolutions_id` PRIMARY KEY(`id`),
	CONSTRAINT `disputeResolutions_disputeId_unique` UNIQUE(`disputeId`)
);
--> statement-breakpoint
CREATE TABLE `disputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`riderId` int NOT NULL,
	`driverId` int NOT NULL,
	`issueType` enum('wrong_fare','unsafe_behavior','lost_item','vehicle_issue','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` enum('open','in_review','resolved','closed') DEFAULT 'open',
	`severity` enum('low','medium','high') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disputes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`riderId` int NOT NULL,
	`driverId` int NOT NULL,
	`overallRating` int NOT NULL,
	`cleanliness` int,
	`safety` int,
	`communication` int,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rideLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`driverId` int NOT NULL,
	`latitude` varchar(50) NOT NULL,
	`longitude` varchar(50) NOT NULL,
	`accuracy` varchar(50),
	`speed` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rideLocations_id` PRIMARY KEY(`id`)
);
