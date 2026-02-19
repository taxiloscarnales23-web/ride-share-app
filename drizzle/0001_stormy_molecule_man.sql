CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`licenseNumber` varchar(50) NOT NULL,
	`licenseExpiry` timestamp,
	`rating` varchar(5) DEFAULT '5.0',
	`totalRides` int DEFAULT 0,
	`isOnline` boolean DEFAULT false,
	`currentLatitude` varchar(50),
	`currentLongitude` varchar(50),
	`bankAccount` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `drivers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `drivers_licenseNumber_unique` UNIQUE(`licenseNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`riderId` int NOT NULL,
	`driverId` int NOT NULL,
	`amount` varchar(50) NOT NULL,
	`tip` varchar(50) DEFAULT '0',
	`totalAmount` varchar(50) NOT NULL,
	`paymentMethod` varchar(50) DEFAULT 'cash',
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_rideId_unique` UNIQUE(`rideId`)
);
--> statement-breakpoint
CREATE TABLE `riders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`rating` varchar(5) DEFAULT '5.0',
	`totalRides` int DEFAULT 0,
	`paymentMethod` varchar(50) DEFAULT 'cash',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riders_id` PRIMARY KEY(`id`),
	CONSTRAINT `riders_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `rides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`driverId` int,
	`pickupLatitude` varchar(50) NOT NULL,
	`pickupLongitude` varchar(50) NOT NULL,
	`pickupAddress` text,
	`dropoffLatitude` varchar(50) NOT NULL,
	`dropoffLongitude` varchar(50) NOT NULL,
	`dropoffAddress` text,
	`estimatedDistance` varchar(50),
	`estimatedDuration` varchar(50),
	`estimatedFare` varchar(50),
	`actualFare` varchar(50),
	`tip` varchar(50) DEFAULT '0',
	`status` enum('requested','accepted','in_progress','completed','cancelled') DEFAULT 'requested',
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`paymentMethod` varchar(50) DEFAULT 'cash',
	`riderRating` int,
	`riderReview` text,
	`driverRating` int,
	`driverReview` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int,
	`color` varchar(50),
	`licensePlate` varchar(50) NOT NULL,
	`registrationExpiry` timestamp,
	`insuranceExpiry` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_licensePlate_unique` UNIQUE(`licensePlate`)
);
