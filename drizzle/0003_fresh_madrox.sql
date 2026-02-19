CREATE TABLE `driverVerification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`licenseDocUrl` text,
	`licenseVerified` boolean DEFAULT false,
	`registrationDocUrl` text,
	`registrationVerified` boolean DEFAULT false,
	`insuranceDocUrl` text,
	`insuranceVerified` boolean DEFAULT false,
	`backgroundCheckStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`backgroundCheckUrl` text,
	`verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`rejectionReason` text,
	`submittedAt` timestamp,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverVerification_id` PRIMARY KEY(`id`),
	CONSTRAINT `driverVerification_driverId_unique` UNIQUE(`driverId`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(50) NOT NULL,
	`referralType` enum('rider','driver','both') NOT NULL,
	`rewardAmount` varchar(50) NOT NULL,
	`referrerRewardClaimed` boolean DEFAULT false,
	`referredRewardClaimed` boolean DEFAULT false,
	`status` enum('active','completed','expired') DEFAULT 'active',
	`expiryDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `scheduledRides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`pickupLatitude` varchar(50) NOT NULL,
	`pickupLongitude` varchar(50) NOT NULL,
	`pickupAddress` text,
	`dropoffLatitude` varchar(50) NOT NULL,
	`dropoffLongitude` varchar(50) NOT NULL,
	`dropoffAddress` text,
	`scheduledTime` timestamp NOT NULL,
	`estimatedFare` varchar(50),
	`status` enum('scheduled','confirmed','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledRides_id` PRIMARY KEY(`id`)
);
