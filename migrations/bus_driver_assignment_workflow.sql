-- Apply once to the Oncab Shuttle database before deploying the /api2 endpoints.

ALTER TABLE `drivers`
  ADD COLUMN `is_bus_driver` tinyint(1) NOT NULL DEFAULT 0 AFTER `vehicle_type_id`,
  ADD COLUMN `preferred_bus_type_id` int UNSIGNED DEFAULT NULL AFTER `is_bus_driver`;

CREATE TABLE IF NOT EXISTS `bus_routes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_name` varchar(255) NOT NULL,
  `route_code` varchar(50) NOT NULL,
  `origin_city` varchar(255) NOT NULL,
  `destination_city` varchar(255) NOT NULL,
  `route_stops` json DEFAULT NULL,
  `total_distance` decimal(10,2) NOT NULL DEFAULT 0,
  `estimated_duration` int NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bus_routes_route_code_unique` (`route_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bus_stops` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` bigint UNSIGNED NOT NULL,
  `stop_name` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL DEFAULT 0,
  `longitude` decimal(11,8) NOT NULL DEFAULT 0,
  `stop_sequence` int NOT NULL,
  `stop_code` varchar(50) NOT NULL,
  `address` text,
  `landmark` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bus_stops_route_sequence_idx` (`route_id`, `stop_sequence`),
  CONSTRAINT `bus_stops_route_fk` FOREIGN KEY (`route_id`) REFERENCES `bus_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bus_schedules` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` bigint UNSIGNED NOT NULL,
  `bus_type_id` int UNSIGNED NOT NULL,
  `schedule_code` varchar(50) NOT NULL,
  `bus_number` varchar(50) NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `operating_days` set('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `base_fare` decimal(10,2) NOT NULL,
  `fare_per_km` decimal(10,2) NOT NULL,
  `status` enum('Active','Inactive','Cancelled') DEFAULT 'Active',
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `driver_id` int UNSIGNED DEFAULT NULL,
  `car_id` bigint UNSIGNED DEFAULT NULL,
  `trip_date` date DEFAULT NULL,
  `seat_capacity` int NOT NULL DEFAULT 30,
  `booked_seats` int NOT NULL DEFAULT 0,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bus_schedules_schedule_code_unique` (`schedule_code`),
  KEY `bus_schedules_route_status_idx` (`route_id`, `status`),
  KEY `bus_schedules_bus_type_status_idx` (`bus_type_id`, `status`),
  CONSTRAINT `bus_schedules_route_fk` FOREIGN KEY (`route_id`) REFERENCES `bus_routes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `bus_schedules_bus_type_fk` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `bus_schedules_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bus_driver_assignments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint UNSIGNED NOT NULL,
  `driver_id` int UNSIGNED NOT NULL,
  `assignment_date` date NOT NULL,
  `reporting_time` time NOT NULL,
  `status` enum('assigned','started','completed','cancelled') DEFAULT 'assigned',
  `start_odometer` decimal(10,2) DEFAULT NULL,
  `end_odometer` decimal(10,2) DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `car_id` bigint UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bus_driver_assignment_driver_date_status_idx` (`driver_id`, `assignment_date`, `status`),
  CONSTRAINT `bus_driver_assignments_schedule_fk` FOREIGN KEY (`schedule_id`) REFERENCES `bus_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bus_driver_assignments_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `bus_driver_assignments`
  ADD UNIQUE KEY `bus_driver_assignment_schedule_date_unique` (`schedule_id`, `assignment_date`);

ALTER TABLE `drivers`
  ADD KEY `drivers_preferred_bus_type_idx` (`preferred_bus_type_id`),
  ADD CONSTRAINT `drivers_preferred_bus_type_fk` FOREIGN KEY (`preferred_bus_type_id`) REFERENCES `bus_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;