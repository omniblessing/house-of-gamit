CREATE TABLE `family_archive` (
	`id` integer PRIMARY KEY NOT NULL,
	`document` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`owner_id` text NOT NULL,
	`updated_at` text NOT NULL
);
