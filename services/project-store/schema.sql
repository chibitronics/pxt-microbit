-- Run once with an administrator on chibitronics-prod, never testdb-encrypted.
CREATE DATABASE IF NOT EXISTS microbit_projects CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS microbit_projects.snapshots (
    id VARCHAR(13) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    project JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX snapshots_created_at (created_at)
) ENGINE=InnoDB;
-- Provision a dedicated TLS-required user with SELECT, INSERT on this schema only.
-- The application cannot alter WordPress data or modify/delete existing snapshots.
