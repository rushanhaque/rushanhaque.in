CREATE TABLE `content_publications` (
	`key` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`previous_body` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
