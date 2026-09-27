CREATE TABLE `content_drafts` (
	`key` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`base_sha` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
