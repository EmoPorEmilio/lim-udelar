PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`username` text,
	`role` text NOT NULL DEFAULT 'student',
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);--> statement-breakpoint
INSERT INTO `__new_users`("id", "google_id", "email", "name", "avatar_url", "username", "role", "created_at", "updated_at")
  SELECT "id", "google_id", "email", "name", "avatar_url", "username", "role", COALESCE("created_at", unixepoch()), COALESCE("updated_at", unixepoch()) FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "user_id", "expires_at", "created_at")
  SELECT "id", "user_id", "expires_at", COALESCE("created_at", unixepoch()) FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_materials` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`subject_code` text,
	`semester` integer,
	`area_code` text,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch()),
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `__new_materials`("id", "title", "description", "subject_code", "semester", "area_code", "file_key", "file_name", "file_size", "mime_type", "uploaded_by", "created_at", "updated_at")
  SELECT "id", "title", "description", "subject_code", "semester", "area_code", "file_key", "file_name", "file_size", "mime_type", "uploaded_by", COALESCE("created_at", unixepoch()), COALESCE("updated_at", unixepoch()) FROM `materials`;--> statement-breakpoint
DROP TABLE `materials`;--> statement-breakpoint
ALTER TABLE `__new_materials` RENAME TO `materials`;--> statement-breakpoint
CREATE INDEX `idx_materials_subject_code` ON `materials` (`subject_code`);--> statement-breakpoint
CREATE INDEX `idx_materials_semester` ON `materials` (`semester`);--> statement-breakpoint
CREATE INDEX `idx_materials_created_at` ON `materials` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_materials_uploaded_by` ON `materials` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `idx_materials_semester_created_at` ON `materials` (`semester`, `created_at`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
