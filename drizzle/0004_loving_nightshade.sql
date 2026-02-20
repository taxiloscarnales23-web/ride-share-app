CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`eventData` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`badgeType` enum('five_star_rated','safety_champion','reliability_expert','customer_favorite','eco_friendly','veteran_driver','quick_responder','perfect_record') NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`type` enum('ride_request','ride_accepted','ride_completed','rating_received','dispute_update','badge_earned','payment_received','system_alert') NOT NULL,
	`relatedId` int,
	`read` boolean DEFAULT false,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `pushNotifications_id` PRIMARY KEY(`id`)
);
