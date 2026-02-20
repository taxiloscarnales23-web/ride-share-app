CREATE TABLE `archivedConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`archivedBy` int NOT NULL,
	`archivedAt` timestamp NOT NULL DEFAULT (now()),
	`restoredAt` timestamp,
	`isArchived` boolean DEFAULT true,
	`archiveReason` varchar(255),
	CONSTRAINT `archivedConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversationMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageCount` int DEFAULT 0,
	`lastMessageAt` timestamp,
	`hasImages` boolean DEFAULT false,
	`hasForwarded` boolean DEFAULT false,
	`hasPinned` boolean DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversationMetadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversationMetadata_conversationId_unique` UNIQUE(`conversationId`)
);
--> statement-breakpoint
CREATE TABLE `conversationSearchIndex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int,
	`searchText` text,
	`messageType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversationSearchIndex_id` PRIMARY KEY(`id`)
);
