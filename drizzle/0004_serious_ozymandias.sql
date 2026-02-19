CREATE TABLE `adminAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`details` text,
	`status` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ridePooling` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mainRideId` int NOT NULL,
	`pooledRideId` int NOT NULL,
	`mainRiderId` int NOT NULL,
	`pooledRiderId` int NOT NULL,
	`driverId` int NOT NULL,
	`pickupOrder` int,
	`discountPercentage` varchar(10) DEFAULT '15',
	`status` enum('matched','in_progress','completed','cancelled') DEFAULT 'matched',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ridePooling_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surgePricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`area` varchar(100) NOT NULL,
	`multiplier` varchar(10) NOT NULL,
	`reason` varchar(100),
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`status` enum('active','inactive') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surgePricing_id` PRIMARY KEY(`id`)
);
