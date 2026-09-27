CREATE TABLE `event_counts` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`event` text NOT NULL,
	`path` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_event_counts_day` ON `event_counts` (`day`);