CREATE TABLE `forwardedMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalMessageId` int NOT NULL,
	`sourceConversationId` int NOT NULL,
	`targetConversationId` int NOT NULL,
	`forwardedBy` int NOT NULL,
	`forwardedAt` timestamp NOT NULL DEFAULT (now()),
	`forwardNote` text,
	`forwardedMessageId` int,
	CONSTRAINT `forwardedMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messageReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`emoji` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pinnedMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`conversationId` int NOT NULL,
	`pinnedBy` int NOT NULL,
	`pinnedAt` timestamp NOT NULL DEFAULT (now()),
	`unPinnedAt` timestamp,
	`isPinned` boolean DEFAULT true,
	CONSTRAINT `pinnedMessages_id` PRIMARY KEY(`id`)
);
