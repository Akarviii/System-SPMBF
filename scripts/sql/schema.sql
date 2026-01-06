libraryfesclibraryfesc-- MySQL DDL for LibApartado (InnoDB + utf8mb4)
CREATE TABLE `accounts_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `first_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'TEACHER',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `date_joined` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `is_superuser` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_email_uniq` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `accounts_user_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_groups_user_group_uniq` (`user_id`,`group_id`),
  CONSTRAINT `accounts_user_groups_user_fk` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `accounts_user_groups_group_fk` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `accounts_user_user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_permissions_uniq` (`user_id`,`permission_id`),
  CONSTRAINT `accounts_user_permissions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `accounts_user_permissions_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `spaces_space` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` varchar(255) NOT NULL,
  `description` longtext,
  `location` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reservations_reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `title` varchar(255) NOT NULL,
  `description` longtext,
  `start_at` datetime(6) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `decision_at` datetime(6) DEFAULT NULL,
  `decision_note` longtext,
  `space_id` int NOT NULL,
  `created_by_id` int NOT NULL,
  `approved_by_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `reservation_space_fk` FOREIGN KEY (`space_id`) REFERENCES `spaces_space` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `reservation_created_by_fk` FOREIGN KEY (`created_by_id`) REFERENCES `accounts_user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `reservation_approved_by_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `accounts_user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX `IX_reservations_space_start` ON `reservations_reservation` (`space_id`, `start_at`);
CREATE INDEX `IX_reservations_space_end` ON `reservations_reservation` (`space_id`, `end_at`);
CREATE INDEX `IX_reservations_created_start` ON `reservations_reservation` (`created_by_id`, `start_at`);
CREATE INDEX `IX_reservations_status_start` ON `reservations_reservation` (`status`, `start_at`);
