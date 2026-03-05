PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`username` text,
	`role` text NOT NULL DEFAULT 'student',
	`storage_quota_bytes` integer NOT NULL DEFAULT 10485760,
	`storage_bytes_used` integer NOT NULL DEFAULT 0,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);--> statement-breakpoint
INSERT INTO `__new_users`("id", "google_id", "email", "name", "avatar_url", "username", "role", "storage_quota_bytes", "storage_bytes_used", "created_at", "updated_at")
  SELECT "id", "google_id", "email", "name", "avatar_url", "username", "role",
    CASE WHEN "role" = 'admin' THEN 104857600 ELSE 10485760 END,
    COALESCE((SELECT SUM("file_size") FROM "materials" WHERE "uploaded_by" = "users"."id"), 0),
    "created_at", "updated_at"
  FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
